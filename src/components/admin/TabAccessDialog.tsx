import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DOCTOR_TABS, PATIENT_TABS, useTabAccess } from '@/contexts/TabAccessContext';
import { useToast } from '@/hooks/use-toast';
import { Settings2, Check, X } from 'lucide-react';

interface TabAccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'doctor' | 'patient';
  entityId: number;
  entityName: string;
}

export default function TabAccessDialog({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
}: TabAccessDialogProps) {
  const { toast } = useToast();
  const { 
    fetchDoctorTabAccess, 
    fetchPatientTabAccess, 
    updateDoctorTabAccess, 
    updatePatientTabAccess 
  } = useTabAccess();

  const [enabledTabs, setEnabledTabs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const tabs = entityType === 'doctor' ? DOCTOR_TABS : PATIENT_TABS;

  useEffect(() => {
    if (isOpen && entityId) {
      loadTabAccess();
    }
  }, [isOpen, entityId, entityType]);

  const loadTabAccess = async () => {
    setLoading(true);
    try {
      let accessTabs: string[];
      if (entityType === 'doctor') {
        accessTabs = await fetchDoctorTabAccess(entityId);
      } else {
        accessTabs = await fetchPatientTabAccess(entityId);
      }
      setEnabledTabs(accessTabs);
    } catch (error) {
      console.error('Error loading tab access:', error);
      // Default to all tabs
      setEnabledTabs(tabs.map(t => t.id));
    } finally {
      setLoading(false);
    }
  };

  const toggleTab = (tabId: string) => {
    setEnabledTabs(prev => 
      prev.includes(tabId)
        ? prev.filter(id => id !== tabId)
        : [...prev, tabId]
    );
  };

  const enableAll = () => {
    setEnabledTabs(tabs.map(t => t.id));
  };

  const disableAll = () => {
    // Keep at least dashboard enabled
    setEnabledTabs(['dashboard']);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let success: boolean;
      if (entityType === 'doctor') {
        success = await updateDoctorTabAccess(entityId, enabledTabs);
      } else {
        success = await updatePatientTabAccess(entityId, enabledTabs);
      }

      if (success) {
        toast({
          title: 'Access Updated',
          description: `Tab access for ${entityName} has been updated successfully.`,
        });
        onClose();
      } else {
        throw new Error('Failed to update access');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tab access. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !saving && !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Tab Access Control
          </DialogTitle>
          <DialogDescription>
            Manage which dashboard tabs <span className="font-medium">{entityName}</span> can access.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={enableAll}>
            <Check className="h-4 w-4 mr-1" />
            Enable All
          </Button>
          <Button variant="outline" size="sm" onClick={disableAll}>
            <X className="h-4 w-4 mr-1" />
            Disable All
          </Button>
          <Badge variant="secondary" className="ml-auto">
            {enabledTabs.length} / {tabs.length} enabled
          </Badge>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-3">
              {tabs.map((tab, index) => (
                <div key={tab.id}>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <Label htmlFor={`tab-${tab.id}`} className="font-medium cursor-pointer">
                        {tab.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{tab.description}</p>
                    </div>
                    <Switch
                      id={`tab-${tab.id}`}
                      checked={enabledTabs.includes(tab.id)}
                      onCheckedChange={() => toggleTab(tab.id)}
                      disabled={tab.id === 'dashboard'} // Dashboard always enabled
                    />
                  </div>
                  {index < tabs.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Button 
            className="flex-1" 
            onClick={handleSave} 
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
