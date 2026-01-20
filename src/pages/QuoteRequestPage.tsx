import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { professionals } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function QuoteRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const professional = professionals.find(p => p.id === id);

  const [formData, setFormData] = useState({
    projectType: '',
    description: '',
    budget: '',
    timeline: '',
    phone: '',
  });

  if (!professional) {
    return (
      <div className="app-container min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Professional not found</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="app-container min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6 animate-scale-in">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2 animate-fade-in">Quote Requested!</h1>
        <p className="text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {professional.name} will respond to your request shortly.
        </p>
        <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Home
          </Button>
          <Button onClick={() => navigate(`/chat/${professional.id}`)}>
            Chat Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Request Quote</h1>
        </div>
      </header>

      {/* Professional Info */}
      <div className="px-4 py-4 border-b border-border animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden">
            <img 
              src={professional.avatar} 
              alt={professional.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{professional.name}</h2>
            <p className="text-sm text-muted-foreground">{professional.profession}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-5 animate-slide-up">
        <div className="space-y-2">
          <Label htmlFor="projectType">Project Type</Label>
          <Select
            value={formData.projectType}
            onValueChange={(value) => setFormData({ ...formData, projectType: value })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="renovation">Renovation</SelectItem>
              <SelectItem value="interior">Interior Design</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Project Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your project requirements..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="min-h-[120px] resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Estimated Budget</Label>
            <Select
              value={formData.budget}
              onValueChange={(value) => setFormData({ ...formData, budget: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="below10">Below ₹10L</SelectItem>
                <SelectItem value="10-25">₹10L - ₹25L</SelectItem>
                <SelectItem value="25-50">₹25L - ₹50L</SelectItem>
                <SelectItem value="50-1cr">₹50L - ₹1Cr</SelectItem>
                <SelectItem value="above1cr">Above ₹1Cr</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline</Label>
            <Select
              value={formData.timeline}
              onValueChange={(value) => setFormData({ ...formData, timeline: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">ASAP</SelectItem>
                <SelectItem value="1-3">1-3 Months</SelectItem>
                <SelectItem value="3-6">3-6 Months</SelectItem>
                <SelectItem value="6-12">6-12 Months</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Contact Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="h-12"
            required
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-base font-semibold gap-2 mt-8"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Request
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
