import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Star, MessageSquare } from 'lucide-react';

type FeedbackItem = {
  id: number;
  patient_user_id?: number | null;
  subject?: string | null;
  message?: string | null;
  status?: string | null;
  department?: string | null;
  rating?: number | null;
  created_at?: string | null;
};

type Tab = 'SURVEYS' | 'RECENT' | 'ANALYTICS';

export default function Feedback() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [tab, setTab] = useState<Tab>('RECENT');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const res = await api.apiGet('/api/feedback');
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || 'Failed');
      setItems(js.items || []);
    } catch (err: unknown) {
      const e = err as Error;
      toast.error('Failed to load: ' + (e?.message ?? String(err)));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((i) =>
    `${i.subject} ${i.message}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <ConsoleShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Feedback Management</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage patient feedback surveys
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">Export</Button>
          <Button>Create Survey</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Feedback</p>
          <p className="text-2xl font-bold">{items.length}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Responses</p>
          <p className="text-2xl font-bold">{items.length}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Average Rating</p>
          <p className="text-2xl font-bold">4.1/5</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Completion Rate</p>
          <p className="text-2xl font-bold">74%</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'SURVEYS', label: 'Surveys' },
          { key: 'RECENT', label: 'Recent Responses' },
          { key: 'ANALYTICS', label: 'Analytics' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={`px-4 py-1.5 rounded-md text-sm transition ${
              tab === t.key
                ? 'bg-black text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6 max-w-md">
        <Input
          placeholder="Search feedback..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Recent Responses */}
      {tab === 'RECENT' && (
        <div className="space-y-4">
          {filtered.map((fb) => (
            <Card key={fb.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {fb.subject || 'Patient Feedback'}
                  </h3>

                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    {fb.created_at && (
                      <span>
                        {new Date(fb.created_at).toLocaleString()}
                      </span>
                    )}
                    {fb.department && (
                      <Badge variant="secondary">{fb.department}</Badge>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        fb.rating && i < fb.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed">
                {fb.message || 'No feedback message'}
              </p>

              <div className="flex justify-end mt-4">
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              </div>
            </Card>
          ))}

          {filtered.length === 0 && (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              No feedback found.
            </Card>
          )}
        </div>
      )}

      {/* Placeholder for other tabs */}
      {tab !== 'RECENT' && (
        <Card className="p-6 text-sm text-muted-foreground">
          {tab === 'SURVEYS' && 'Survey list UI goes here'}
          {tab === 'ANALYTICS' && 'Analytics charts go here'}
        </Card>
      )}
    </ConsoleShell>
  );
}
