import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Star, MessageSquare, Loader2 } from 'lucide-react';

type FeedbackItem = {
  id: number;
  resource_type: string;
  resource_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

type Tab = 'SURVEYS' | 'RECENT' | 'ANALYTICS';

export default function Feedback() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalFeedback: 0,
    avgRating: '0',
    recentCount: 0,
    ratingDistribution: [] as { rating: number; count: number }[]
  });
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [tab, setTab] = useState<Tab>('RECENT');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary
      const summaryRes = await api.apiGet('/api/dashboard/feedback/summary');
      const summaryData = await summaryRes.json();
      if (summaryRes.ok) {
        setSummary(summaryData);
      }

      // Fetch feedback list
      let url = '/api/dashboard/feedback/list?';
      if (search) url += `search=${encodeURIComponent(search)}`;
      
      const listRes = await api.apiGet(url);
      const listData = await listRes.json();
      if (listRes.ok) {
        setItems(listData.feedback || []);
      }
    } catch (err) {
      console.error('Error loading feedback:', err);
      toast.error('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const filtered = items.filter((i) =>
    `${i.resource_name} ${i.comment}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Calculate completion rate from rating distribution
  const totalResponses = summary.ratingDistribution.reduce((sum, r) => sum + r.count, 0);
  const completionRate = summary.totalFeedback > 0 
    ? Math.round((totalResponses / summary.totalFeedback) * 100) 
    : 0;

  if (loading) {
    return (
      <ConsoleShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ConsoleShell>
    );
  }

  return (
    <ConsoleShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Feedback Management</h1>
          <p className="text-sm text-muted-foreground">
            View and manage patient feedback and reviews
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
          <p className="text-2xl font-bold">{summary.totalFeedback}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Recent (30 days)</p>
          <p className="text-2xl font-bold">{summary.recentCount}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Average Rating</p>
          <p className="text-2xl font-bold">{summary.avgRating}/5</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Response Rate</p>
          <p className="text-2xl font-bold">{completionRate}%</p>
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
                    {fb.resource_name || 'Patient Feedback'}
                  </h3>

                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    {fb.created_at && (
                      <span>
                        {new Date(fb.created_at).toLocaleString()}
                      </span>
                    )}
                    {fb.resource_type && (
                      <Badge variant="secondary" className="capitalize">{fb.resource_type}</Badge>
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
                {fb.comment || 'No feedback message'}
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

      {/* Analytics Tab */}
      {tab === 'ANALYTICS' && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = summary.ratingDistribution.find(r => r.rating === rating)?.count || 0;
              const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center w-16">
                    {rating} <Star className="h-3 w-3 ml-1 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Surveys Tab */}
      {tab === 'SURVEYS' && (
        <Card className="p-6 text-sm text-muted-foreground">
          No surveys created yet. Click "Create Survey" to get started.
        </Card>
      )}
    </ConsoleShell>
  );
}