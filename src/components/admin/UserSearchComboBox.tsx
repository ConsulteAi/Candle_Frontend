'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2, User as UserIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { httpClient } from '@/lib/api/httpClient';
import type { AdminUser, PaginatedResponse } from '@/types/admin';

interface UserSearchComboBoxProps {
  ownerId?: string | null;
  onSelect: (ownerId: string | null) => void;
  disabled?: boolean;
  error?: string;
}

export function UserSearchComboBox({
  ownerId,
  onSelect,
  disabled,
  error,
}: UserSearchComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<AdminUser | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Fetch users when search changes
  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await httpClient.get<PaginatedResponse<AdminUser>>(
          '/admin/users',
          {
            params: {
              search: debouncedSearch,
              limit: 5,
            },
          }
        );
        setUsers(response.data.data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [debouncedSearch, open]);

  // Fetch initial selected user if ownerId exists but not in the list
  React.useEffect(() => {
    const fetchSelectedUser = async () => {
      if (!ownerId) {
        setSelectedUser(null);
        return;
      }
      
      // If we already have the user in our current list, just use that
      const existingUser = users.find(u => u.id === ownerId);
      if (existingUser) {
        setSelectedUser(existingUser);
        return;
      }

      // Otherwise fetch the specific user by ID
      try {
        const response = await httpClient.get<AdminUser>(`/admin/users/${ownerId}`);
        setSelectedUser(response.data);
      } catch (error) {
        console.error('Failed to fetch selected user', error);
      }
    };

    if (ownerId && ownerId !== selectedUser?.id) {
      fetchSelectedUser();
    } else if (!ownerId) {
      setSelectedUser(null);
    }
  }, [ownerId, users]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal transition-all duration-200',
            'hover:bg-slate-50 hover:border-slate-300 focus:ring-2 focus:ring-slate-100',
            error ? 'border-red-500 focus:ring-red-100' : 'border-slate-200',
            disabled && 'bg-slate-50 text-slate-500 cursor-not-allowed opacity-70'
          )}
          disabled={disabled}
        >
          {selectedUser ? (
            <div className="flex items-center gap-2 truncate">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
                <UserIcon className="h-3 w-3 text-slate-500" />
              </div>
              <span className="truncate font-medium text-slate-700">
                {selectedUser.name}
              </span>
              <span className="text-slate-400 text-xs truncate ml-1">
                {selectedUser.email}
              </span>
            </div>
          ) : (
            <span className="text-slate-500">
              {disabled ? 'Tenant default não deve ter owner' : 'Selecione um usuário...'}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 shadow-xl border-slate-200/60 rounded-xl overflow-hidden backdrop-blur-xl bg-white/95" align="start">
        <Command shouldFilter={false} className="bg-transparent">
          <CommandInput 
            placeholder="Buscar por nome, email ou CPF/CNPJ..." 
            value={search}
            onValueChange={setSearch}
            className="border-none focus:ring-0 text-sm h-11"
          />
          <CommandList className="max-h-[300px] p-1">
            {loading && (
              <div className="p-6 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2 animate-in fade-in duration-200">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                <span>Buscando usuários...</span>
              </div>
            )}
            {!loading && users.length === 0 && search.length > 0 && (
              <CommandEmpty className="py-6 flex flex-col items-center justify-center gap-2 text-slate-500 text-sm animate-in fade-in zoom-in-95 duration-200">
                <UserIcon className="h-8 w-8 text-slate-200 mb-1" />
                Nenhum usuário encontrado.
              </CommandEmpty>
            )}
            {!loading && users.length > 0 && (
              <CommandGroup>
                {/* Option to clear selection */}
                {ownerId && (
                   <CommandItem
                     value="clear"
                     onSelect={() => {
                       onSelect('');
                       setOpen(false);
                     }}
                     className="text-red-600 data-[selected=true]:text-red-700 data-[selected=true]:bg-red-50 cursor-pointer rounded-lg mb-1 flex items-center"
                   >
                     <X className="mr-2 h-4 w-4" />
                     Remover Owner Atual
                   </CommandItem>
                )}
                <div className="space-y-1">
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={(currentValue) => {
                      onSelect(currentValue === ownerId ? '' : currentValue);
                      setOpen(false);
                    }}
                    className={cn(
                      "cursor-pointer rounded-lg transition-colors flex items-center p-2",
                      ownerId === user.id ? "bg-slate-100/50" : ""
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 mr-3">
                      <UserIcon className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex flex-col flex-1 truncate">
                      <span className="font-medium truncate">{user.name}</span>
                      <span className="text-xs truncate opacity-70">{user.email}</span>
                    </div>
                    {ownerId === user.id && (
                      <Check className="h-4 w-4 ml-2 shrink-0 opacity-70" />
                    )}
                  </CommandItem>
                ))}
                </div>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
