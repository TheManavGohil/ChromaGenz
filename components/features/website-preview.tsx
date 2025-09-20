import { Color } from '@/types';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Palette, Laptop, Zap } from 'lucide-react';

interface WebsitePreviewProps {
  colors: Color[];
}

export function WebsitePreview({ colors }: WebsitePreviewProps) {
  // Ensure we have enough colors
  if (!colors || colors.length < 5) return null;

  // Extract colors for different elements
  const [primary, secondary, accent, text, background] = colors;

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Website Preview</h3>
        <div 
          className="rounded-lg overflow-hidden"
          style={{ background: background.hex }}
        >
          {/* Navbar */}
          <div 
            className="p-4 flex justify-between items-center"
            style={{ background: primary.hex }}
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Palette style={{ color: text.hex }} className="h-6 w-6" />
                <span style={{ color: text.hex }} className="font-bold text-lg">
                  ChromaGen
                </span>
              </div>
              <nav className="hidden sm:flex gap-4">
                {['Home', 'About', 'Services', 'Contact'].map((item) => (
                  <span
                    key={item}
                    style={{ color: text.hex }}
                    className="cursor-pointer hover:opacity-80"
                  >
                    {item}
                  </span>
                ))}
              </nav>
            </div>
            <Button
              style={{
                background: accent.hex,
                color: text.hex,
              }}
            >
              Sign Up
            </Button>
          </div>

          {/* Hero Section */}
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Left Content */}
            <div className="space-y-4">
              <h1 
                className="text-2xl font-bold"
                style={{ color: text.hex }}
              >
                Welcome to Our Platform
              </h1>
              <p
                className="opacity-80"
                style={{ color: text.hex }}
              >
                Experience the next generation of digital solutions with our innovative platform. We help you achieve your goals faster and more efficiently.
              </p>
              <div className="flex gap-3">
                <Button
                  style={{
                    background: secondary.hex,
                    color: text.hex,
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  style={{
                    borderColor: accent.hex,
                    color: text.hex,
                  }}
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2264&auto=format&fit=crop"
                alt="Colorful Design"
                fill
                className="object-cover"
                style={{ opacity: 0.9 }}
              />
              <div 
                className="absolute inset-0"
                style={{ 
                  background: `linear-gradient(135deg, ${primary.hex}80, ${secondary.hex}80)`,
                }}
              />
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-3 gap-4 p-8">
            {[
              {
                icon: Palette,
                title: "AI Generation",
                description: "Create stunning color palettes with advanced AI algorithms."
              },
              {
                icon: Laptop,
                title: "Live Preview",
                description: "See your colors in action with real-time website previews."
              },
              {
                icon: Zap,
                title: "Quick Export",
                description: "Export your palettes in multiple formats instantly."
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="p-4 rounded-lg"
                style={{ 
                  background: i === 1 ? secondary.hex : 'rgba(255,255,255,0.1)',
                  color: text.hex
                }}
              >
                <feature.icon className="h-6 w-6 mb-3" style={{ color: text.hex }} />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm opacity-80">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
