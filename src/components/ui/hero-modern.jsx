import React from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroModern({
  eyebrow = "Powered by Monad Blockchain",
  title = "Decentralized GPU Compute Power",
  subtitle = "Rent high-performance GPUs using MON tokens. Access enterprise-grade compute resources on the blockchain.",
  ctaLabel = "Get Started",
  ctaHref = "/signup",
  secondaryCtaLabel = "Explore GPUs",
  secondaryCtaHref = "/login",
}) {
  return (
    <section
      id="hero"
      className="relative mx-auto w-full pt-40 px-6 text-center md:px-8 
      min-h-[calc(100vh-40px)] overflow-hidden 
      bg-[linear-gradient(to_bottom,#080310,#080310_50%,#100820_88%)]  
      dark:bg-[linear-gradient(to_bottom,#000,#0000_30%,#898e8e_78%,#ffffff_99%_50%)] 
      rounded-b-xl"
    >
      {/* Grid BG - Purple themed */}
      <div
        className="absolute -z-10 inset-0 opacity-30 h-[600px] w-full 
        bg-[linear-gradient(to_right,#8b5cf6_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf6_1px,transparent_1px)] 
        bg-[size:6rem_5rem] 
        [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
      />

      {/* Radial Accent - Purple */}
      <div
        className="absolute left-1/2 top-[calc(100%-90px)] lg:top-[calc(100%-150px)] 
        h-[500px] w-[700px] md:h-[500px] md:w-[1100px] lg:h-[750px] lg:w-[140%] 
        -translate-x-1/2 rounded-[100%] border-[#8b5cf6] bg-[#080310]
        bg-[radial-gradient(closest-side,#100820_82%,#8b5cf6)] 
        animate-fade-up"
      />

      {/* Eyebrow */}
      {eyebrow && (
        <a href="#" className="group inline-block mb-6">
          <span
            className="text-sm text-purple-300 font-medium mx-auto px-5 py-2 
            bg-gradient-to-tr from-purple-500/20 via-purple-400/10 to-transparent  
            border-[2px] border-purple-400/30
            rounded-3xl w-fit tracking-tight flex items-center justify-center"
          >
            ✨ {eyebrow}
            <ChevronRight className="inline w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </a>
      )}

      {/* Title - Monad Purple Gradient */}
      <h1
        className="animate-fade-in -translate-y-4 text-balance 
        bg-gradient-to-br from-white via-purple-200 to-purple-500
        bg-clip-text py-6 text-5xl font-bold leading-none tracking-tighter 
        text-transparent opacity-0 sm:text-6xl md:text-7xl lg:text-8xl 
        font-['Orbitron',monospace]"
        style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      <p
        className="animate-fade-in mb-12 -translate-y-4 text-balance 
        text-lg tracking-tight text-purple-300/90
        opacity-0 md:text-xl max-w-3xl mx-auto"
        style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
      >
        {subtitle}
      </p>

      {/* CTA Buttons */}
      <div 
        className="flex justify-center gap-4 flex-wrap animate-fade-in opacity-0"
        style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
      >
        {ctaLabel && (
          <Button
            asChild
            className="w-fit md:w-52 z-20 font-medium tracking-tight text-center text-lg 
            bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400
            shadow-lg shadow-purple-500/50"
          >
            <a href={ctaHref}>{ctaLabel}</a>
          </Button>
        )}
        {secondaryCtaLabel && (
          <Button
            asChild
            variant="outline"
            className="w-fit md:w-52 z-20 font-medium tracking-tight text-center text-lg
            border-purple-400 text-purple-200 hover:bg-purple-900/30"
          >
            <a href={secondaryCtaHref}>{secondaryCtaLabel}</a>
          </Button>
        )}
      </div>

      {/* GPU Visualization Cards */}
      <div 
        className="animate-fade-up relative mt-20 opacity-0 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
      >
        {[
          { name: "RTX 4090", price: "12 MON/hr", power: "24GB VRAM" },
          { name: "A100", price: "28 MON/hr", power: "40GB VRAM" },
          { name: "H100", price: "55 MON/hr", power: "80GB HBM3" }
        ].map((gpu, idx) => (
          <div 
            key={idx}
            className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm
            hover:bg-purple-900/30 hover:border-purple-400/50 transition-all duration-300
            hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
          >
            <div className="text-purple-400 text-sm font-medium mb-2">{gpu.power}</div>
            <div className="text-white text-2xl font-bold mb-2 font-['Orbitron',monospace]">{gpu.name}</div>
            <div className="text-purple-300 text-lg">{gpu.price}</div>
          </div>
        ))}
      </div>

      {/* Bottom Fade */}
      <div
        className="animate-fade-up relative mt-32 opacity-0 
        after:absolute after:inset-0 after:z-50 
        after:bg-gradient-to-t after:from-[#080310] after:to-transparent"
        style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
      />
    </section>
  )
}
