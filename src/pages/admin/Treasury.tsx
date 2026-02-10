import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Payment, Profile, UserRole } from '@/types';
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, Lock } from 'lucide-react';

const Treasury = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPayoutOpen, setIsPayoutOpen] = useState(false);
    const [newPayout, setNewPayout] = useState({
        payee: '', amount: ''
    });

    const fetchData = async () => {
        try {
            const [payRes, userRes] = await Promise.all([
                api.get('/payments/'),
                api.get('/users/')
            ]);
            setPayments(payRes.data);
            setUsers(userRes.data);
        } catch (error) {
            toast.error("Failed to load treasury data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreatePayout = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/payments/', {
                payee: newPayout.payee,
                amount: newPayout.amount,
                payment_type: 'Payout',
                status: 'Paid', // Admin payouts are immediate for now
                payer: undefined
            });
            toast.success("Payout recorded successfully");
            setIsPayoutOpen(false);
            setNewPayout({ payee: '', amount: '' });
            fetchData();
        } catch (error) {
            toast.error("Failed to record payout");
        }
    };

    const developers = users.filter(u => u.role === UserRole.DEVELOPER && u.is_approved);

    // Stats Calculation
    const totalIncoming = payments
        .filter(p => p.payment_type === 'Incoming' && p.status === 'Paid')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const totalOutgoing = payments
        .filter(p => p.payment_type === 'Payout' && p.status === 'Paid')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const netProfit = totalIncoming - totalOutgoing;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                            <Lock className="w-8 h-8 text-indigo-600" />
                            WMT Treasury
                        </h1>
                        <p className="text-slate-500 mt-1">Work Management Treasury - Admin Access Only</p>
                    </div>
                    <Dialog open={isPayoutOpen} onOpenChange={setIsPayoutOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg">
                                <Wallet className="w-4 h-4 mr-2" /> Record Payout
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleCreatePayout}>
                                <DialogHeader>
                                    <DialogTitle>Record Developer Payout</DialogTitle>
                                    <DialogDescription>Manually record a payment sent to a developer.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Developer</Label>
                                        <Select onValueChange={(val) => setNewPayout({ ...newPayout, payee: val })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Developer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {developers.map(dev => (
                                                    <SelectItem key={dev.user.id} value={String(dev.user.id)}>
                                                        {dev.user.username}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Amount ($)</Label>
                                        <Input type="number" value={newPayout.amount} onChange={(e) => setNewPayout({ ...newPayout, amount: e.target.value })} required />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Confirm Payout</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Client Payments</CardTitle>
                            <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">${totalIncoming.toFixed(2)}</div>
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Incoming Revenue
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-50 to-white hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Developer Payouts</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">${totalOutgoing.toFixed(2)}</div>
                            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Expenses
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-indigo-50 to-white hover:shadow-md transition-all border-indigo-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-600">Platform Profit</CardTitle>
                            <DollarSign className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-indigo-900">${netProfit.toFixed(2)}</div>
                            <p className="text-xs text-indigo-600 mt-1 font-medium">
                                Net Commission
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-lg border-0">
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>Live record of all incoming and outgoing payments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Payer</TableHead>
                                        <TableHead>Payee</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading transactions...</TableCell>
                                        </TableRow>
                                    ) : payments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">No transactions recorded yet.</TableCell>
                                        </TableRow>
                                    ) : (
                                        payments.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium text-slate-900">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${p.payment_type === 'Incoming'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {p.payment_type === 'Incoming' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                                        {p.payment_type}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{p.payer_name || 'System'}</TableCell>
                                                <TableCell>{p.payee_name || 'System'}</TableCell>
                                                <TableCell className="text-right font-bold text-slate-900">${p.amount}</TableCell>
                                                <TableCell>
                                                    <span className="text-slate-600 text-sm">{p.status}</span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Treasury;
