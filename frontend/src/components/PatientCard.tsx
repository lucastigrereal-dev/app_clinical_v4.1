/**
 * Patient card component for dashboard display
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Patient } from '@/types/api';
import { ChevronRight, Calendar, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard = ({ patient }: PatientCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-custom transition-shadow cursor-pointer group" 
          onClick={() => navigate(`/patients/${patient.id}`)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{patient.name}</CardTitle>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>Clinic ID: {patient.clinicId}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Patient ID: #{patient.id}</span>
        </div>

        <div className="flex justify-between items-center mt-4">
          <Badge variant="secondary">Active Patient</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patients/${patient.id}`);
            }}
          >
            View Timeline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};