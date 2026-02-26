'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Check, User, Lock, Eye, EyeOff } from "lucide-react";
import { updateProfile, changePassword } from './actions';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfileFormProps {
    user: {
        id: string;
        name: string | null;
        email: string;
        createdAt: Date;
    };
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [name, setName] = useState(user.name || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPw, setChangingPw] = useState(false);
    const [pwSuccess, setPwSuccess] = useState(false);
    const [pwError, setPwError] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSaveProfile = async () => {
        setSaving(true);
        setError('');
        setSaved(false);
        try {
            const result = await updateProfile({ name: name.trim() });
            if (result.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                setError(result.message || 'Error al guardar');
            }
        } catch {
            setError('Error inesperado');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setChangingPw(true);
        setPwError('');
        setPwSuccess(false);
        try {
            const result = await changePassword({ currentPassword, newPassword, confirmPassword });
            if (result.success) {
                setPwSuccess(true);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => setPwSuccess(false), 3000);
            } else {
                setPwError(result.message || 'Error al cambiar contraseña');
            }
        } catch {
            setPwError('Error inesperado');
        } finally {
            setChangingPw(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Profile Info */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border">
                            <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                {user.name?.[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Información Personal
                            </CardTitle>
                            <CardDescription>Actualiza tu nombre y revisa tu información.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Tu nombre"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={user.email}
                                disabled
                                className="bg-muted/50"
                            />
                            <p className="text-[11px] text-muted-foreground">El email no se puede cambiar.</p>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Miembro desde {new Date(user.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <div className="flex justify-end">
                        <Button onClick={handleSaveProfile} disabled={saving || name.trim() === (user.name || '')}>
                            {saving ? (
                                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Guardando...</>
                            ) : saved ? (
                                <><Check className="h-4 w-4 mr-2" /> Guardado</>
                            ) : (
                                'Guardar cambios'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Cambiar Contraseña
                    </CardTitle>
                    <CardDescription>Ingresa tu contraseña actual para establecer una nueva.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Contraseña actual</Label>
                        <div className="relative">
                            <Input
                                id="currentPassword"
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Ingresa tu contraseña actual"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nueva contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Mínimo 8 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repite la nueva contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {newPassword && newPassword.length < 8 && (
                        <p className="text-xs text-amber-600">La contraseña debe tener al menos 8 caracteres</p>
                    )}
                    {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
                    )}

                    {pwError && <p className="text-sm text-destructive">{pwError}</p>}
                    {pwSuccess && <p className="text-sm text-green-600">Contraseña actualizada correctamente</p>}

                    <div className="flex justify-end">
                        <Button
                            onClick={handleChangePassword}
                            disabled={changingPw || !currentPassword || !newPassword || newPassword.length < 8 || newPassword !== confirmPassword}
                            variant="outline"
                        >
                            {changingPw ? (
                                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Cambiando...</>
                            ) : (
                                'Cambiar contraseña'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
