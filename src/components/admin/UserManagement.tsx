import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  AlertTriangle
} from "lucide-react";

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    wilaya?: string;
  };
}

interface UserManagementProps {
  users: User[];
  onUserAction: (userId: string, action: string) => void;
}

const UserManagement = ({ users, onUserAction }: UserManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "نشط", color: "bg-green-100 text-green-800" },
      pending: { label: "في الانتظار", color: "bg-yellow-100 text-yellow-800" },
      suspended: { label: "موقوف", color: "bg-red-100 text-red-800" },
      banned: { label: "محظور", color: "bg-red-100 text-red-800" }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.active;
  };

  const getRoleBadge = (role: string) => {
    const roles = {
      admin: { label: "مدير", color: "bg-purple-100 text-purple-800" },
      driver: { label: "سائق", color: "bg-blue-100 text-blue-800" },
      passenger: { label: "راكب", color: "bg-gray-100 text-gray-800" }
    };
    return roles[role as keyof typeof roles] || roles.passenger;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
          <p className="text-muted-foreground">إدارة جميع مستخدمي النظام</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            تصدير البيانات
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            إضافة مستخدم
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المستخدمين (الاسم، البريد، الهاتف)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                <SelectItem value="passenger">الركاب</SelectItem>
                <SelectItem value="driver">السائقون</SelectItem>
                <SelectItem value="admin">المديرون</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="pending">في الانتظار</SelectItem>
                <SelectItem value="suspended">موقوف</SelectItem>
                <SelectItem value="banned">محظور</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => {
          const statusInfo = getStatusBadge(user.status);
          const roleInfo = getRoleBadge(user.role);
          
          return (
            <Card key={user.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-lg">
                        {user.profile?.first_name?.charAt(0) || user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">
                          {user.profile?.first_name} {user.profile?.last_name} 
                        </h3>
                        <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        {user.role === 'driver' && user.status === 'active' && (
                          <Shield className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                          {user.profile?.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{user.profile.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>انضم في {user.created_at}</span>
                          </div>
                          {user.profile?.wilaya && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>ولاية {user.profile.wilaya}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          عرض
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>تفاصيل المستخدم</DialogTitle>
                        </DialogHeader>
                        {selectedUser && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback className="text-xl">
                                  {selectedUser.profile?.first_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-xl font-bold">
                                  {selectedUser.profile?.first_name} {selectedUser.profile?.last_name}
                                </h3>
                                <div className="flex gap-2 mt-1">
                                  <Badge className={getRoleBadge(selectedUser.role).color}>
                                    {getRoleBadge(selectedUser.role).label}
                                  </Badge>
                                  <Badge className={getStatusBadge(selectedUser.status).color}>
                                    {getStatusBadge(selectedUser.status).label}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">معلومات الاتصال</h4>
                                <div className="space-y-2 text-sm">
                                  <div>البريد: {selectedUser.email}</div>
                                  <div>الهاتف: {selectedUser.profile?.phone || "غير محدد"}</div>
                                  <div>الولاية: {selectedUser.profile?.wilaya || "غير محدد"}</div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">معلومات الحساب</h4>
                                <div className="space-y-2 text-sm">
                                  <div>تاريخ التسجيل: {selectedUser.created_at}</div>
                                  <div>آخر دخول: {selectedUser.last_sign_in}</div>
                                  <div>الحالة: {getStatusBadge(selectedUser.status).label}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      تعديل
                    </Button>
                    
                    {user.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => onUserAction(user.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        موافقة
                      </Button>
                    )}
                    
                    {user.status === 'active' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onUserAction(user.id, 'suspend')}
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        إيقاف
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => onUserAction(user.id, 'delete')}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground">جرب تغيير معايير البحث أو التصفية</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;