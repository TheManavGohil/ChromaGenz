'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Palette, Sparkles, Eye, Download, ArrowRight, Star, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { initializeMockData } from '@/utils/storage';

export default function Home() {
  useEffect(() => {
    initializeMockData();
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Generate beautiful color palettes using advanced AI algorithms that understand color harmony and design principles.',
    },
    {
      icon: Eye,
      title: 'Accessibility First',
      description: 'Built-in contrast checking and color blindness simulation ensure your palettes work for everyone.',
    },
    {
      icon: Palette,
      title: 'Multi-Modal Input',
      description: 'Create palettes from text prompts, image uploads, or URLs. Multiple ways to spark your creativity.',
    },
    {
      icon: Download,
      title: 'Export Everything',
      description: 'Export your palettes in multiple formats: HEX, RGB, HSL, CSS, PDF, and Adobe Swatch files.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'UI/UX Designer',
      content: 'ChromaGen has revolutionized my design workflow. The accessibility features are game-changing.',
      rating: 5,
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Brand Designer',
      content: 'The AI suggestions are incredibly smart. It understands color harmony better than any tool I\'ve used.',
      rating: 5,
    },
    {
      name: 'Emma Thompson',
      role: 'Frontend Developer',
      content: 'Love the export options! Being able to grab CSS variables directly saves me so much time.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(135deg, #C2FFF9 0%, #00B3A6 25%, #008080 50%, #004D40 75%, #08090A 100%)',
          }}
        />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                Create Beautiful
                <span className="block bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
                  Color Palettes
                </span>
                with AI
              </h1>
              
              <p className="text-xl md:text-2xl text-cyan-100 mb-8 max-w-3xl mx-auto">
                Generate stunning, accessible color schemes that inspire creativity and ensure inclusivity. 
                Perfect for designers, developers, and creative professionals.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/generate">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    Generate Palette
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Explore Trending
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Demo Palette */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1">
                  <div className="flex rounded-md overflow-hidden shadow-lg">
                    {['#C2FFF9', '#00B3A6', '#008080', '#004D40', '#F4F7F5'].map((color, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 md:w-20 md:h-20 transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-cyan-200 text-sm">
                AI-generated palette: Ocean Breeze
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Powerful Features for Creative Professionals
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to create, analyze, and export professional color palettes
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-primary mr-2" />
                <span className="text-3xl font-bold">10,000+</span>
              </div>
              <p className="text-muted-foreground">Creative Professionals</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center mb-2">
                <Palette className="h-8 w-8 text-primary mr-2" />
                <span className="text-3xl font-bold">500K+</span>
              </div>
              <p className="text-muted-foreground">Palettes Generated</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-8 w-8 text-primary mr-2" />
                <span className="text-3xl font-bold">99.9%</span>
              </div>
              <p className="text-muted-foreground">Accessibility Compliance</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Loved by Designers Worldwide
              </h2>
              <p className="text-xl text-muted-foreground">
                See what creative professionals are saying about ChromaGen
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Create Amazing Palettes?
            </h2>
            <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
              Join thousands of designers and developers who trust ChromaGen for their color needs.
            </p>
            <Link href="/generate">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                Start Generating
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}