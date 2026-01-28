import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { useAdminPayments, type Payment } from "@/hooks/usePayments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentStatusBadge } from "@/components/payments/PaymentStatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Calendar,
  Loader2,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

export default function AdminPayments() {
  const { payments, loading, validatePayment } = useAdminPayments();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null);
  const [loadingProof, setLoadingProof] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: id });
  };

  const methodLabels: Record<string, string> = {
    cod: "COD",
    bank_transfer: "Transfer Bank (Manual)",
    bank_transfer_integrated: "Transfer Bank (Terintegrasi)",
    dana: "DANA",
    gopay: "GoPay",
    ovo: "OVO",
    shopeepay: "ShopeePay",
  };

  // Fetch signed URL for payment proof when payment is selected
  useEffect(() => {
    const fetchProofUrl = async () => {
      if (!selectedPayment?.proof_url) {
        setProofImageUrl(null);
        return;
      }

      setLoadingProof(true);
      try {
        const proofPath = selectedPayment.proof_url;

        if (proofPath.startsWith("http")) {
          const match = proofPath.match(/\/payment-proofs\/(.+)$/);
          if (match && match[1]) {
            const filePath = match[1];
            const { data, error } = await supabase.storage
              .from("payment-proofs")
              .createSignedUrl(filePath, 3600);

            if (error) {
              console.error("Error creating signed URL:", error);
              setProofImageUrl(proofPath);
            } else {
              setProofImageUrl(data?.signedUrl || proofPath);
            }
          } else {
            setProofImageUrl(proofPath);
          }
        } else {
          const { data, error } = await supabase.storage
            .from("payment-proofs")
            .createSignedUrl(proofPath, 3600);

          if (error) {
            console.error("Error creating signed URL:", error);
            const { data: publicUrlData } = supabase.storage
              .from("payment-proofs")
              .getPublicUrl(proofPath);
            setProofImageUrl(publicUrlData?.publicUrl || proofPath);
          } else {
            setProofImageUrl(data?.signedUrl || proofPath);
          }
        }
      } catch (err) {
        console.error("Error fetching proof URL:", err);
        setProofImageUrl(selectedPayment.proof_url);
      } finally {
        setLoadingProof(false);
      }
    };

    fetchProofUrl();
  }, [selectedPayment?.proof_url]);

  const handleValidate = async (status: "approved" | "rejected") => {
    if (!selectedPayment) return;

    setIsValidating(true);
    const success = await validatePayment(
      selectedPayment.id,
      status,
      adminNotes
    );
    setIsValidating(false);

    if (success) {
      setSelectedPayment(null);
      setAdminNotes("");
      setProofImageUrl(null);
    }
  };

  const pendingPayments = payments.filter(
    (p) => p.status === "pending" || p.status === "waiting_validation"
  );
  const completedPayments = payments.filter(
    (p) =>
      p.status === "approved" ||
      p.status === "rejected" ||
      p.status === "cancelled"
  );

  if (loading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Payment Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and validate payment proofs
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Validation
                </CardTitle>
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingPayments.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting review
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Amount
                </CardTitle>
                <CreditCard className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(
                    pendingPayments.reduce((sum, p) => sum + p.amount, 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pending payments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {completedPayments.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time validated
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Tables */}
          <Card>
            <Tabs defaultValue="pending" className="w-full">
              <CardHeader className="border-b">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="pending" className="relative">
                    Pending
                    {pendingPayments.length > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-2 h-5 min-w-5 px-1"
                      >
                        {pendingPayments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="pending" className="p-6">
                {pendingPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No pending payments
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingPayments.map((payment) => {
                        const bookingDetails = payment.booking_details as {
                          companion_name?: string;
                          package_name?: string;
                        } | null;

                        return (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {bookingDetails?.companion_name || "Booking"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {bookingDetails?.package_name}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatPrice(payment.amount)}
                            </TableCell>
                            <TableCell>
                              {methodLabels[payment.method]}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-3 w-3" />
                                {formatDate(payment.created_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <PaymentStatusBadge
                                status={payment.status}
                                size="sm"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPayment(payment)}
                              >
                                {payment.proof_url && (
                                  <ImageIcon className="h-4 w-4 mr-2" />
                                )}
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="completed" className="p-6">
                {completedPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No completed payments yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedPayments.map((payment) => {
                        const bookingDetails = payment.booking_details as {
                          companion_name?: string;
                        } | null;

                        return (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div className="font-medium">
                                {bookingDetails?.companion_name || "Booking"}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatPrice(payment.amount)}
                            </TableCell>
                            <TableCell>
                              {methodLabels[payment.method]}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(payment.created_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <PaymentStatusBadge
                                status={payment.status}
                                size="sm"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Validation Dialog */}
        <Dialog
          open={!!selectedPayment}
          onOpenChange={() => {
            setSelectedPayment(null);
            setAdminNotes("");
            setProofImageUrl(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payment Validation</DialogTitle>
              <DialogDescription>
                Review payment proof and validate
              </DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-4">
                {/* Payment Info */}
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Method
                      </span>
                      <span className="font-medium">
                        {methodLabels[selectedPayment.method]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Amount
                      </span>
                      <span className="font-semibold text-lg text-primary">
                        {formatPrice(selectedPayment.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Date</span>
                      <span className="text-sm">
                        {formatDate(selectedPayment.created_at)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Proof Image */}
                {selectedPayment.proof_url && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Payment Proof:</p>
                    {loadingProof ? (
                      <div className="w-full h-64 flex items-center justify-center bg-muted rounded-lg border">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : proofImageUrl ? (
                      proofImageUrl.toLowerCase().endsWith(".pdf") ? (
                        <a
                          href={proofImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg border hover:bg-muted/80 transition-colors"
                        >
                          <ImageIcon className="h-4 w-4" />
                          View PDF
                        </a>
                      ) : (
                        <div className="relative">
                          <img
                            src={proofImageUrl}
                            alt="Payment proof"
                            className="w-full rounded-lg border"
                            onError={(e) => {
                              console.error("Error loading image:", proofImageUrl);
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <a
                            href={proofImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute top-2 right-2 p-2 bg-background/90 backdrop-blur-sm rounded-lg border hover:bg-background transition-colors"
                            title="Open in new tab"
                          >
                            <ImageIcon className="h-4 w-4" />
                          </a>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center bg-muted rounded-lg border text-sm text-muted-foreground">
                        Failed to load payment proof
                      </div>
                    )}
                  </div>
                )}

                {/* Notes from User */}
                {selectedPayment.notes && (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm font-medium mb-2">User Notes:</p>
                      <div className="text-sm text-muted-foreground whitespace-pre-line">
                        {selectedPayment.notes}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Transfer Details */}
                {selectedPayment.booking_details &&
                  typeof selectedPayment.booking_details === "object" &&
                  "transfer_details" in selectedPayment.booking_details &&
                  selectedPayment.booking_details.transfer_details && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="pt-6 space-y-3">
                        <p className="text-sm font-semibold">
                          Transfer Information:
                        </p>
                        {selectedPayment.booking_details.transfer_details
                          .sender_account_number && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Account Number:
                            </span>
                            <span className="text-sm font-mono font-semibold">
                              {
                                selectedPayment.booking_details.transfer_details
                                  .sender_account_number
                              }
                            </span>
                          </div>
                        )}
                        {selectedPayment.booking_details.transfer_details
                          .sender_name && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Sender Name:
                            </span>
                            <span className="text-sm font-semibold">
                              {
                                selectedPayment.booking_details.transfer_details
                                  .sender_name
                              }
                            </span>
                          </div>
                        )}
                        {selectedPayment.booking_details.transfer_details
                          .transfer_amount && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Transfer Amount:
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              {formatPrice(
                                selectedPayment.booking_details.transfer_details
                                  .transfer_amount
                              )}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                {/* Admin Notes Input */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Admin Notes:</p>
                  <Textarea
                    placeholder="Add notes (required if rejecting)"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleValidate("rejected")}
                    disabled={isValidating}
                  >
                    {isValidating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </>
                    )}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleValidate("approved")}
                    disabled={isValidating}
                  >
                    {isValidating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}