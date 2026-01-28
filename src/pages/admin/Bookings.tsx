import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useAdminBookings } from '@/hooks/admin/useAdminBookings';
import { BookingStatus } from '@/types/admin';
import { Search, Eye, CheckCircle, XCircle, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminBookings() {
  const navigate = useNavigate();
  const {
    bookings,
    loading,
    filters,
    updateFilters,
    approveBooking,
    rejectBooking,
    cancelBooking,
  } = useAdminBookings();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'cancel';
    bookingId: string | null;
  }>({ open: false, type: 'approve', bookingId: null });
  const [actionNotes, setActionNotes] = useState('');

  if (loading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-96 w-full" />
        </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.renter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.companion_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleActionClick = (
    type: 'approve' | 'reject' | 'cancel',
    bookingId: string
  ) => {
    setActionDialog({ open: true, type, bookingId });
    setActionNotes('');
  };

  const handleActionConfirm = async () => {
    if (!actionDialog.bookingId) return;

    switch (actionDialog.type) {
      case 'approve':
        await approveBooking(actionDialog.bookingId, actionNotes);
        break;
      case 'reject':
        await rejectBooking(actionDialog.bookingId, actionNotes);
        break;
      case 'cancel':
        await cancelBooking(actionDialog.bookingId, actionNotes);
        break;
    }

    setActionDialog({ open: false, type: 'approve', bookingId: null });
    setActionNotes('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
          <p className="text-muted-foreground">
            Manage and approve booking requests
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              updateFilters({ status: value as BookingStatus | 'all' })
            }
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Renter</TableHead>
                <TableHead>Companion</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">
                      {booking.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.renter_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.renter_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={booking.companion_avatar || undefined} />
                          <AvatarFallback>
                            {booking.companion_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{booking.companion_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{format(new Date(booking.booking_date), 'dd MMM yyyy')}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.booking_time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{booking.duration}h</TableCell>
                    <TableCell>{formatPrice(booking.total_price)}</TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.created_at), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleActionClick('approve', booking.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleActionClick('reject', booking.id)}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        {(booking.status === 'pending' || booking.status === 'approved') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleActionClick('cancel', booking.id)}
                          >
                            <Ban className="h-4 w-4 text-orange-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

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
                onClick={() => setActionDialog({ open: false, type: 'approve', bookingId: null })}
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