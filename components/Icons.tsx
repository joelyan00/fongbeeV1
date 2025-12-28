
import React from 'react';
import { 
  Wrench, 
  Droplet, 
  Sparkles, 
  Home, 
  Pipette, 
  Tv, 
  DoorOpen, 
  Wind, 
  Armchair, 
  Smartphone, 
  Zap, 
  Thermometer, 
  Hammer,
  Monitor,
  Grid,
  Sprout,
  Calculator,
  Laptop,
  Scissors,
  Banknote,
  Building2,
  Car,
  Plane,
  Ticket,
  Snowflake,
  Disc,
  Truck,
  FileText,
  Wallet,
  Calendar,
  Clock,
  ClipboardList,
  RotateCcw,
  Search,
  CheckCircle,
  ShoppingCart,
  MapPin,
  Settings,
  Headphones
} from 'lucide-react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const AppIcon: React.FC<IconProps> = ({ name, size = 24, className = "", style }) => {
  const icons: Record<string, React.ElementType> = {
    'wrench': Wrench,
    'droplet': Droplet,
    'sparkles': Sparkles,
    'home': Home,
    'pipette': Pipette,
    'tv': Tv,
    'door': DoorOpen,
    'wind': Wind,
    'chair': Armchair,
    'phone': Smartphone,
    'zap': Zap,
    'thermometer': Thermometer,
    'hammer': Hammer,
    'monitor': Monitor,
    'laptop': Laptop,
    'grid': Grid,
    'sprout': Sprout,
    'calculator': Calculator,
    'file-text': FileText,
    'scissors': Scissors,
    'banknote': Banknote,
    'building': Building2,
    'car': Car,
    'truck': Truck,
    'plane': Plane,
    'ticket': Ticket,
    'snowflake': Snowflake,
    'disc': Disc,
    'wallet': Wallet,
    'calendar': Calendar,
    'clock': Clock,
    'clipboard': ClipboardList,
    'rotate-ccw': RotateCcw,
    'search': Search,
    'check-circle': CheckCircle,
    'shopping-cart': ShoppingCart,
    'map-pin': MapPin,
    'settings': Settings,
    'headphones': Headphones
  };

  const IconComponent = icons[name] || Wrench;
  return <IconComponent size={size} className={className} style={style} />;
};
