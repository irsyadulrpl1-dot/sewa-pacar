import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useAdminBookings } from '@/hooks/admin/useAdminBookings';
import { AdminBooking } from '@/types/admin';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  CreditCard,
  CheckCircle,
  XCircle,
  Ban,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBookingById, approveBooking, rejectBooking, cancelBooking } = useAdminBookings();

  const [booking, setBooking] = useState<AdminBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'cancel';
  }>({ open: false, type: 'approve' });
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    if (id) {
      loadBooking();
    }
  }, [id]);

  const loadBooking = async () => {
    if (!id) return;
    setLoading(true);
    const data = await getBookingById(id);
    setBooking(data);
    setLoading(false);
  };

  const handleActionClick = (type: 'approve' | 'reject' | 'cancel') => {
    setActionDialog({ open: true, type });
    setActionNotes('');
  };

  const handleActionConfirm = async () => {
    if (!booking) return;

    switch (actionDialog.type) {
      case 'approve':
        await approveBooking(booking.id, actionNotes);
        break;
      case 'reject':
        await rejectBooking(booking.id, actionNotes);
        break;
      case 'cancel':
        await cancelBooking(booking.id, actionNotes);
        break;
    }

    setActionDialog({ open: false, type: 'approve' });
    setActionNotes('');
    await loadBooking();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  if (!booking) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Booking not found</p>
          <Button onClick={() => navigate('/admin/bookings')} className="mt-4">
            Back to Bookings
          </Button>
        </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/bookings')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Booking Details</h1>
              <p className="text-muted-foreground">ID: {booking.id}</p>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Renter Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Renter Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{booking.renter_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{booking.renter_email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Companion Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Companion Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={booking.companion_avatar || undefined} />
                  <AvatarFallback>
                    {booking.companion_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{booking.companion_name}</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => navigate(`/companion/${booking.companion_id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(booking.booking_date), 'EEEE, dd MMMM yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{booking.booking_time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{booking.duration} hours</p>
                </div>
              </div>
              {booking.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{booking.location}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="text-2xl font-bold">{formatPrice(booking.total_price)}</p>
              </div>
              {booking.payment_status && (
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <StatusBadge status={booking.payment_status} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          {(booking.notes || booking.notes) && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Renter Notes</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{booking.notes}</p>
                  </div>
                )}
                {booking.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Admin Notes</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status History */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Booking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Booking Created</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.created_at), 'dd MMM yyyy, HH:mm')}
                    </p>
                  </div>
                </div>
                {booking.updated_at !== booking.created_at && (
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 mt-2 rounded-full bg-muted" />
                    <div className="flex-1">
                      <p className="font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.updated_at), 'dd MMM yyyy, HH:mm')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        {booking.status === 'pending' && (
          <Card>
            <CardContent className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                onClick={() => handleActionClick('approve')}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Booking
              </Button>
              <Button
                onClick={() => handleActionClick('reject')}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Booking
              </Button>
            </CardContent>
          </Card>
        )}

        {(booking.status === 'pending' || booking.status === 'approved') && (
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={() => handleActionClick('cancel')}
                variant="outline"
                className="w-full"
              >
                <Ban className="h-4 w-4 mr-2" />
                Cancel Booking
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Action Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog.type === 'approve' && 'Approve Booking'}
                {actionDialog.type === 'reject' && 'Reject Booking'}
                {actionDialog.type === 'cancel' && 'Cancel Booking'}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.type === 'approve' && 'Add optional notes for the approval'}
                {actionDialog.type === 'reject' && 'Please provide a reason for rejection'}
                {actionDialog.type === 'cancel' && 'Please provide a reason for cancellation'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder={
                  actionDialog.type === 'approve'
                    ? 'Optional notes...'
                    : 'Reason (required)...'
                }
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setActionDialog({ open: false, type: 'approve' })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleActionConfirm}
                disabled={actionDialog.type !== 'approve' && !actionNotes.trim()}
                variant={actionDialog.type === 'approve' ? 'default' : 'destructive'}
              >
                {actionDialog.type === 'approve' && 'Approve'}
                {actionDialog.type === 'reject' && 'Reject'}
                {actionDialog.type === 'cancel' && 'Cancel Booking'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}