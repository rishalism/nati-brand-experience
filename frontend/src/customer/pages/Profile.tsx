import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { BadgeCheck, MapPin, Package, LogOut } from 'lucide-react';
import { changePasswordSchema, type ChangePasswordInput } from '@nati/shared';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/shop/CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/services/api-client';
import { useAuthStore } from '@/features/auth/auth.store';
import { authApi } from '@/features/auth/auth.api';
import { useCart, useCartUi } from '@/features/cart/cart.hooks';
import { useAddresses } from '@/features/addresses/addresses.hooks';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
});
type ProfileInput = z.infer<typeof profileSchema>;

const Profile = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: cart } = useCart();
  const cartUi = useCartUi();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '' },
  });

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSaveProfile = async (values: ProfileInput) => {
    try {
      await authApi.updateProfile(values);
      toast({ title: 'Profile updated' });
    } catch (error) {
      toast({
        title: 'Could not update profile',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const onChangePassword = async (values: ChangePasswordInput) => {
    try {
      await authApi.changePassword(values.currentPassword, values.newPassword);
      passwordForm.reset({ currentPassword: '', newPassword: '' });
      toast({ title: 'Password changed' });
    } catch (error) {
      toast({
        title: 'Could not change password',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/');
  };

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cart?.itemCount ?? 0} onCartClick={cartUi.open} />

      <main className="pt-24 pb-16 md:pb-20">
        <section className="container py-8 md:py-12 max-w-4xl">
          {/* Identity */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8 md:mb-12">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/15 text-primary flex items-center justify-center font-heading text-2xl md:text-3xl tracking-wider flex-shrink-0">
              {initials || 'N'}
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-3xl md:text-4xl tracking-wider text-foreground">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <p className="text-muted-foreground font-body text-sm break-all">{user?.email}</p>
                {user?.emailVerified && (
                  <Badge variant="secondary" className="gap-1">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
              {user?.createdAt && (
                <p className="text-muted-foreground/70 text-xs font-body mt-1">
                  Member since{' '}
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Edit profile */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading tracking-wider text-xl">PROFILE</CardTitle>
                <CardDescription>Update your name.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" {...profileForm.register('firstName')} />
                      {profileForm.formState.errors.firstName && (
                        <p className="text-destructive text-xs">
                          {profileForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" {...profileForm.register('lastName')} />
                      {profileForm.formState.errors.lastName && (
                        <p className="text-destructive text-xs">
                          {profileForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email ?? ''} disabled />
                    <p className="text-muted-foreground text-xs">Email can't be changed.</p>
                  </div>
                  <Button
                    type="submit"
                    disabled={profileForm.formState.isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {profileForm.formState.isSubmitting ? 'Saving...' : 'Save changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change password */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading tracking-wider text-xl">PASSWORD</CardTitle>
                <CardDescription>Choose a strong password you don't use elsewhere.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={passwordForm.handleSubmit(onChangePassword)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      {...passwordForm.register('currentPassword')}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-destructive text-xs">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      autoComplete="new-password"
                      {...passwordForm.register('newPassword')}
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-destructive text-xs">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={passwordForm.formState.isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {passwordForm.formState.isSubmitting ? 'Updating...' : 'Change password'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-heading tracking-wider text-xl">
                  SAVED ADDRESSES
                </CardTitle>
                <CardDescription>Addresses you've used at checkout.</CardDescription>
              </CardHeader>
              <CardContent>
                {addressesLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-28 rounded-lg" />
                    <Skeleton className="h-28 rounded-lg" />
                  </div>
                )}
                {!addressesLoading && (!addresses || addresses.length === 0) && (
                  <p className="text-muted-foreground text-sm font-body">
                    No saved addresses yet — you can add one during checkout.
                  </p>
                )}
                {!addressesLoading && addresses && addresses.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((a) => (
                      <div
                        key={a.id}
                        className="border border-border rounded-lg p-4 space-y-1 font-body text-sm"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="font-medium text-foreground">{a.label}</span>
                          {a.isDefault && <Badge variant="secondary">Default</Badge>}
                        </div>
                        <p className="text-foreground">{a.recipientName}</p>
                        <p className="text-muted-foreground">
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ''}
                        </p>
                        <p className="text-muted-foreground">
                          {a.city}, {a.state} {a.postalCode}, {a.country}
                        </p>
                        {a.phone && <p className="text-muted-foreground">{a.phone}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link to="/orders" className="sm:flex-none">
              <Button variant="outline" className="w-full gap-2">
                <Package className="h-4 w-4" /> View orders
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="gap-2 text-destructive hover:text-destructive sm:ml-auto"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Profile;
