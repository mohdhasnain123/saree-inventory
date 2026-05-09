import { FormEvent, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RefreshCw,
  Shuffle,
  Users,
  Copy,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface UserRow {
  _id: string;
  username: string;
  name?: string;
  role: "admin" | "manager" | "staff";
  status: "active" | "inactive";
  lastLoginAt?: string | null;
  passwordChangedAt?: string | null;
}

interface UserManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MIN_LEN = 6;

const roleVariant: Record<UserRow["role"], "default" | "secondary" | "outline"> = {
  admin: "default",
  manager: "secondary",
  staff: "outline",
};

const generatePassword = (len = 12) => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*";
  const all = upper + lower + digits + special;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let out = pick(upper) + pick(lower) + pick(digits) + pick(special);
  for (let i = out.length; i < len; i++) out += pick(all);
  return out
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

const UserManagementDialog = ({ open, onOpenChange }: UserManagementDialogProps) => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: users = [], isLoading, refetch } = useQuery<UserRow[]>({
    queryKey: ["auth-users"],
    queryFn: () => api.get<UserRow[]>("/auth/users"),
    enabled: open,
  });

  useEffect(() => {
    if (!resetTarget) {
      setNewPassword("");
      setShowPassword(false);
      setError(null);
    }
  }, [resetTarget]);

  const resetMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      api.post<{ ok: boolean; username: string }>(`/auth/users/${id}/reset-password`, {
        newPassword: password,
      }),
    onSuccess: (res) => {
      toast({
        title: "Password reset",
        description: `Password updated for "${res.username}". Share the new password with them securely.`,
      });
      queryClient.invalidateQueries({ queryKey: ["auth-users"] });
      setResetTarget(null);
    },
    onError: (err: Error) =>
      setError(err.message || "Could not reset password."),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    const pw = newPassword.trim();
    if (pw.length < MIN_LEN) {
      setError(`Password must be at least ${MIN_LEN} characters.`);
      return;
    }
    setError(null);
    resetMutation.mutate({ id: resetTarget._id, password: pw });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      toast({ title: "Copied", description: "Password copied to clipboard." });
    } catch {
      toast({
        title: "Copy failed",
        description: "Clipboard not available. Select and copy manually.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (s?: string | null) =>
    s ? new Date(s).toLocaleString() : "—";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> User Management
            </DialogTitle>
            <DialogDescription>
              Reset passwords for any user. Useful when a teammate has forgotten
              their password.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          <div className="overflow-auto max-h-[60vh] border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Last login</TableHead>
                  <TableHead className="hidden md:table-cell">Password set</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Loading users...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
                {users.map((u) => {
                  const isSelf = currentUser?._id === u._id;
                  return (
                    <TableRow key={u._id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {u.name || u.username}
                            {isSelf && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (you)
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            @{u.username}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleVariant[u.role]} className="capitalize">
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span
                          className={
                            u.status === "active"
                              ? "text-success"
                              : "text-muted-foreground"
                          }
                        >
                          {u.status}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatDate(u.lastLoginAt)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatDate(u.passwordChangedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setResetTarget(u)}
                          disabled={isSelf}
                          title={
                            isSelf
                              ? "Use 'Change Password' from your account menu instead."
                              : "Reset this user's password"
                          }
                        >
                          <KeyRound className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset password sub-dialog */}
      <Dialog
        open={!!resetTarget}
        onOpenChange={(o) => !o && setResetTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" /> Reset password
            </DialogTitle>
            <DialogDescription>
              Set a new password for{" "}
              <strong>{resetTarget?.name || resetTarget?.username}</strong> (@
              {resetTarget?.username}). They can log in with this immediately and
              should change it after.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-new-password">New password</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="reset-new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={MIN_LEN}
                    required
                    autoFocus
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setNewPassword(generatePassword(12));
                    setShowPassword(true);
                  }}
                  title="Generate a strong random password"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Generate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopy}
                  disabled={!newPassword}
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum {MIN_LEN} characters. Make sure to share it with the user
                via a secure channel.
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2">
                {error}
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setResetTarget(null)}
                disabled={resetMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-primary"
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" /> Reset password
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserManagementDialog;
