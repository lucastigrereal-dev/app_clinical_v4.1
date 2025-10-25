/**
 * Timeline item card for patient history display
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimelineItem } from '@/types/api';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineCardProps {
  item: TimelineItem;
  isFirst?: boolean;
  isLast?: boolean;
}

export const TimelineCard = ({ item, isFirst, isLast }: TimelineCardProps) => {
  const getPhaseColor = (phase: string) => {
    switch (phase.toLowerCase()) {
      case 'd0':
        return 'bg-primary text-primary-foreground';
      case 'd30':
        return 'bg-accent text-accent-foreground';
      case 'd90':
        return 'bg-warning text-warning-foreground';
      case 'm6':
        return 'bg-success text-success-foreground';
      case 'm12':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="flex items-start space-x-4 relative">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-20 bg-border"></div>
      )}
      
      {/* Phase indicator */}
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold z-10
        ${getPhaseColor(item.phase)}
      `}>
        {item.phase}
      </div>

      {/* Content card */}
      <Card className="flex-1 hover:shadow-custom transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{item.title}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {item.phase}
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(item.date), 'MMM dd, yyyy')}</span>
            <Clock className="h-3 w-3 ml-2" />
            <span>{format(new Date(item.date), 'HH:mm')}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};