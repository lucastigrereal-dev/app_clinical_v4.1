/**
 * Patient detail page showing timeline and photo upload
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { TimelineCard } from '@/components/TimelineCard';
import { PhotoUpload } from '@/components/PhotoUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Patient, TimelineItem } from '@/types/api';
import { ArrowLeft, Calendar, Building2, Camera, Clock } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from '@/hooks/use-toast';

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPatientData(parseInt(id));
    }
  }, [id]);

  const fetchPatientData = async (patientId: number) => {
    try {
      const [patientResponse, timelineResponse] = await Promise.all([
        api.get(`/patients/${patientId}`),
        api.get(`/patients/${patientId}/timeline`)
      ]);

      setPatient(patientResponse.data);
      setTimeline(timelineResponse.data);
    } catch (error) {
      toast({
        title: "Error loading patient",
        description: "Failed to load patient details. Please try again.",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUploadSuccess = () => {
    toast({
      title: "Photos uploaded",
      description: "Patient photos have been successfully uploaded.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-lg font-semibold mb-2">Patient not found</h2>
              <p className="text-muted-foreground mb-4">
                The requested patient could not be found.
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{patient.name}</h1>
            <p className="text-muted-foreground">Patient timeline and documentation</p>
          </div>
        </div>

        {/* Patient info card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Patient Information</span>
              <Badge variant="secondary">Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Clinic ID</p>
                  <p className="text-sm text-muted-foreground">{patient.clinicId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Patient ID</p>
                  <p className="text-sm text-muted-foreground">#{patient.id}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for timeline and photos */}
        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timeline" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Treatment Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Photo Upload</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Treatment Timeline</CardTitle>
                <CardDescription>
                  Patient journey from D0 to M12 with key milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {timeline.length > 0 ? (
                  <div className="space-y-6">
                    {timeline.map((item, index) => (
                      <TimelineCard
                        key={item.id}
                        item={item}
                        isFirst={index === 0}
                        isLast={index === timeline.length - 1}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No timeline events</h3>
                    <p className="text-muted-foreground">
                      This patient's timeline will appear here as events are added.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Photo Documentation</CardTitle>
                <CardDescription>
                  Upload patient photos for treatment documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoUpload 
                  patientId={patient.id} 
                  onUploadSuccess={handlePhotoUploadSuccess} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PatientDetail;