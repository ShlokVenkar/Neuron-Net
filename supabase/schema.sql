-- ============================================
-- NEURON NET DATABASE SCHEMA
-- Supabase PostgreSQL Setup for GPU Marketplace
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (Extended User Info)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    wallet_address TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'seller', 'team', 'admin')),
    is_premium BOOLEAN DEFAULT FALSE,
    premium_tier TEXT CHECK (premium_tier IN ('pro', 'enterprise', NULL)),
    premium_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GPU LISTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS gpu_listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cuda_cores INTEGER NOT NULL,
    vram INTEGER NOT NULL,
    price_per_hour DECIMAL(10, 4) NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    total_rentals INTEGER DEFAULT 0,
    blockchain_gpu_id INTEGER, -- Reference to smart contract GPU ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RENTALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rentals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rental_number SERIAL,
    gpu_id UUID REFERENCES gpu_listings(id) ON DELETE SET NULL,
    renter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    hours INTEGER NOT NULL,
    base_cost DECIMAL(10, 4) NOT NULL,
    discount_amount DECIMAL(10, 4) DEFAULT 0,
    total_cost DECIMAL(10, 4) NOT NULL,
    work_description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'disputed')),
    assistance_requested BOOLEAN DEFAULT FALSE,
    output_delivered BOOLEAN DEFAULT FALSE,
    blockchain_rental_id INTEGER, -- Reference to smart contract rental ID
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ASSISTANCE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assistance_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    work_description TEXT NOT NULL,
    gpu_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    output_uploaded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OUTPUT FILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS output_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assistance_request_id UUID REFERENCES assistance_requests(id) ON DELETE CASCADE,
    rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Supabase storage path
    file_size BIGINT,
    file_type TEXT,
    bucket_name TEXT DEFAULT 'neuron-outputs',
    is_delivered BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AD REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ad_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('general-inquiry', 'bulk-advertising', 'partnership')),
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('pro', 'enterprise')),
    price DECIMAL(10, 2) NOT NULL,
    blockchain_tx_hash TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RENTAL LOGS TABLE (For tracking GPU usage)
-- ============================================
CREATE TABLE IF NOT EXISTS rental_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
    log_message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_gpu_listings_seller ON gpu_listings(seller_id);
CREATE INDEX idx_gpu_listings_available ON gpu_listings(is_available);
CREATE INDEX idx_rentals_renter ON rentals(renter_id);
CREATE INDEX idx_rentals_seller ON rentals(seller_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_assistance_requests_status ON assistance_requests(status);
CREATE INDEX idx_assistance_requests_assigned ON assistance_requests(assigned_to);
CREATE INDEX idx_output_files_rental ON output_files(rental_id);
CREATE INDEX idx_output_files_delivered ON output_files(is_delivered);
CREATE INDEX idx_ad_requests_status ON ad_requests(status);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpu_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE output_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" 
    ON profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- GPU Listings: Anyone can view, sellers can manage their own
CREATE POLICY "GPU listings are viewable by everyone" 
    ON gpu_listings FOR SELECT 
    USING (true);

CREATE POLICY "Sellers can insert their own listings" 
    ON gpu_listings FOR INSERT 
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings" 
    ON gpu_listings FOR UPDATE 
    USING (auth.uid() = seller_id);

-- Rentals: Users can see their own rentals
CREATE POLICY "Users can view their own rentals" 
    ON rentals FOR SELECT 
    USING (auth.uid() = renter_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create rentals" 
    ON rentals FOR INSERT 
    WITH CHECK (auth.uid() = renter_id);

-- Assistance Requests: Users can see their own, team can see all
CREATE POLICY "Users can view their own assistance requests" 
    ON assistance_requests FOR SELECT 
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team'
    ));

CREATE POLICY "Users can create assistance requests" 
    ON assistance_requests FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Output Files: Users can see their own output files, team can manage
CREATE POLICY "Users can view their own output files" 
    ON output_files FOR SELECT 
    USING (
        EXISTS (SELECT 1 FROM rentals WHERE id = rental_id AND renter_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team')
    );

CREATE POLICY "Team can upload output files" 
    ON output_files FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team'
    ));

-- Ad Requests: Team can view and manage all
CREATE POLICY "Team can view ad requests" 
    ON ad_requests FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team'
    ));

CREATE POLICY "Anyone can create ad requests" 
    ON ad_requests FOR INSERT 
    WITH CHECK (true);

-- Subscriptions: Users can view their own
CREATE POLICY "Users can view their own subscriptions" 
    ON subscriptions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
    ON subscriptions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Rental Logs: Viewable by rental participants
CREATE POLICY "Users can view rental logs" 
    ON rental_logs FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM rentals 
        WHERE id = rental_id 
        AND (renter_id = auth.uid() OR seller_id = auth.uid())
    ));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gpu_listings_updated_at BEFORE UPDATE ON gpu_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assistance_requests_updated_at BEFORE UPDATE ON assistance_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_requests_updated_at BEFORE UPDATE ON ad_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check and update premium status
CREATE OR REPLACE FUNCTION check_premium_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user has active subscription
    IF EXISTS (
        SELECT 1 FROM subscriptions 
        WHERE user_id = NEW.user_id 
        AND is_active = TRUE 
        AND expires_at > NOW()
    ) THEN
        UPDATE profiles 
        SET is_premium = TRUE, 
            premium_tier = NEW.tier,
            premium_expiry = NEW.expires_at
        WHERE id = NEW.user_id;
    ELSE
        UPDATE profiles 
        SET is_premium = FALSE, 
            premium_tier = NULL,
            premium_expiry = NULL
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update premium status on subscription change
CREATE TRIGGER update_premium_status_on_subscription
    AFTER INSERT OR UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION check_premium_status();

-- ============================================
-- STORAGE BUCKETS (Run these in Supabase Dashboard or via API)
-- ============================================

-- Create storage bucket for output files
-- Run this in Supabase SQL Editor or Storage settings:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('neuron-outputs', 'neuron-outputs', false);

-- Storage policies for neuron-outputs bucket
-- CREATE POLICY "Team can upload output files" ON storage.objects FOR INSERT 
--     WITH CHECK (bucket_id = 'neuron-outputs' AND EXISTS (
--         SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team'
--     ));

-- CREATE POLICY "Users can download their output files" ON storage.objects FOR SELECT 
--     USING (bucket_id = 'neuron-outputs' AND EXISTS (
--         SELECT 1 FROM output_files 
--         WHERE file_path = name 
--         AND rental_id IN (SELECT id FROM rentals WHERE renter_id = auth.uid())
--     ));

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View for active rentals with details
CREATE OR REPLACE VIEW active_rentals_view AS
SELECT 
    r.id,
    r.rental_number,
    r.status,
    r.total_cost,
    r.assistance_requested,
    r.output_delivered,
    p_renter.email AS renter_email,
    p_renter.full_name AS renter_name,
    g.name AS gpu_name,
    g.cuda_cores,
    g.vram,
    r.started_at,
    r.work_description
FROM rentals r
LEFT JOIN profiles p_renter ON r.renter_id = p_renter.id
LEFT JOIN gpu_listings g ON r.gpu_id = g.id
WHERE r.status = 'active';

-- View for pending assistance requests
CREATE OR REPLACE VIEW pending_assistance_view AS
SELECT 
    ar.id,
    ar.user_name,
    ar.user_email,
    ar.work_description,
    ar.gpu_name,
    ar.status,
    ar.output_uploaded,
    ar.created_at,
    r.rental_number
FROM assistance_requests ar
LEFT JOIN rentals r ON ar.rental_id = r.id
WHERE ar.status IN ('pending', 'in-progress')
ORDER BY ar.created_at DESC;

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- Insert a team member (update with your team email)
-- INSERT INTO profiles (id, email, full_name, role) 
-- VALUES (
--     'your-team-member-uuid', 
--     'team@neuronnet.com', 
--     'Support Team', 
--     'team'
-- );

-- ============================================
-- END OF SCHEMA
-- ============================================
