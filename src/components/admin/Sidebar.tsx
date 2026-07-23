import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Image as ImageIcon, 
  MessageSquare, 
  Users, 
  Mail, 
  Settings,
  UserCircle,
  LogOut,
  Compass,
  Home
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import toast from 'react-hot-toast';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'News & Updates', icon: FileText, path: '/admin/news' },
    { name: 'Services', icon: Briefcase, path: '/admin/services' },
    { name: 'Hajj & Umrah', icon: Compass, path: '/admin/hajj-umrah' },
    { name: 'Scholarships', icon: GraduationCap, path: '/admin/scholarships' },
    { name: 'Testimonials', icon: MessageSquare, path: '/admin/testimonials' },
  ];

  if (user?.role === 'Super Admin') {
    navItems.push({ name: 'Gallery', icon: ImageIcon, path: '/admin/gallery' });
  }

  navItems.push(
    { name: 'Subscribers', icon: Users, path: '/admin/subscribers' },
    { name: 'Contact Messages', icon: Mail, path: '/admin/messages' }
  );

  // Super Admin only routes
  if (user?.role === 'Super Admin') {
    navItems.push(
      { name: 'Admin Users', icon: Users, path: '/admin/users' },
      { name: 'System Health', icon: Activity, path: '/admin/health' },
      { name: 'System Settings', icon: Settings, path: '/admin/settings' }
    );
  }

  return (
    <div className="flex flex-col w-64 bg-primary-900 text-white h-full border-r border-primary-800">
      <div className="p-6 flex items-center justify-between border-b border-primary-800 shrink-0">
        <h1 className="text-xl font-serif font-bold text-gold-500 text-center leading-tight w-full">
          Sohibulminsor Classic<br/>
          <span className="text-xs text-primary-200 uppercase tracking-widest font-sans">Admin Portal</span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col min-h-full">
          <div className="py-6 flex-1">
            <nav className="space-y-1 px-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gold-500 text-primary-900 shadow-md'
                        : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon
                    className={`flex-shrink-0 mr-3 h-5 w-5 transition-colors duration-200`}
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-primary-800 shrink-0">
            <div className="mb-4 px-2 flex flex-col space-y-3">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-800 flex items-center justify-center border border-primary-700 overflow-hidden flex-shrink-0">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="h-6 w-6 text-gold-500" />
                  )}
                </div>
                <div className="ml-3 truncate">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gold-400 font-medium truncate">{user?.role}</p>
                </div>
              </div>
              <div className="bg-primary-800/50 p-2.5 rounded-lg space-y-1">
                <p className="text-[10px] text-primary-300 uppercase tracking-wider font-semibold">Email</p>
                <p className="text-xs text-primary-100 truncate" title={user?.email}>{user?.email}</p>
                <div className="pt-1 mt-1 border-t border-primary-700/50">
                  <p className="text-[10px] text-primary-300 uppercase tracking-wider font-semibold">Last Login</p>
                  <p className="text-xs text-primary-100 truncate">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            <nav className="space-y-1">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 text-primary-200 hover:bg-primary-800 hover:text-white"
              >
                <Home className="flex-shrink-0 mr-3 h-5 w-5 text-primary-400 group-hover:text-white" />
                View Website
              </a>
              <NavLink
                to="/admin/profile"
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-800 text-white'
                      : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                  }`
                }
              >
                <UserCircle className="flex-shrink-0 mr-3 h-5 w-5 text-primary-400 group-hover:text-white" />
                Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
              >
                <LogOut className="flex-shrink-0 mr-3 h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
