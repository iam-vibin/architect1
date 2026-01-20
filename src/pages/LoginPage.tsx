import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Paintbrush, HardHat, User, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface RoleOption {
  role: UserRole;
  label: string;
  icon: React.ElementType;
  description: string;
  gradient: string;
}

const roleOptions: RoleOption[] = [
  {
    role: 'user',
    label: 'Customer',
    icon: User,
    description: 'Find & hire professionals',
    gradient: 'from-primary to-primary/80',
  },
  {
    role: 'professional',
    label: 'Professional',
    icon: Building2,
    description: 'Architect, Designer, Builder',
    gradient: 'from-secondary to-secondary/80',
  },
  {
    role: 'admin',
    label: 'Admin',
    icon: Shield,
    description: 'Platform management',
    gradient: 'from-accent-foreground to-accent-foreground/80',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password, selectedRole);
    
    if (success) {
      if (selectedRole === 'admin') {
        navigate('/admin');
      } else if (selectedRole === 'professional') {
        navigate('/professional-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError('Invalid credentials');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="app-container min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold gradient-text">ArchiFind</h1>
        <p className="text-muted-foreground mt-2">Find your perfect professional</p>
      </div>

      {/* Role Selection */}
      <div className="px-6 mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <Label className="text-sm font-medium text-muted-foreground mb-3 block">
          Login as
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedRole === option.role;
            
            return (
              <button
                key={option.role}
                onClick={() => setSelectedRole(option.role)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  'text-xs font-medium',
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <form onSubmit={handleLogin} className="login-card space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>

          <div className="text-center">
            <button type="button" className="text-sm text-primary font-medium">
              Forgot password?
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="p-6 text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button className="text-primary font-medium">Sign up</button>
        </p>
      </div>
    </div>
  );
}
