import React, { useState } from 'react';
import { Copy, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { translations } from '../../utils/translations';
import { generateInviteCode } from '../../utils/invite';

export const OrganizationSettings = () => {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !inviteCode.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // Clear any existing invite code context
      await supabase.rpc('set_invite_code_context', {
        input_code: null
      });

      // Set invite code context
      await supabase.rpc('set_invite_code_context', {
        input_code: inviteCode.trim()
      });

      // Find organization by invite code
      const { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('invite_code', inviteCode.trim().toUpperCase());

      if (orgError) {
        console.error('Failed to lookup organization:', orgError);
        setError(translations.invalidInviteCode);
        await supabase.rpc('set_invite_code_context', { input_code: null });
        return;
      }

      if (!orgs || orgs.length === 0) {
        setError(translations.invalidInviteCode);
        await supabase.rpc('set_invite_code_context', { input_code: null });
        return;
      }

      const organizationId = orgs[0].id;

      // Update user's organization
      const { error: updateError } = await supabase
        .from('users')
        .update({ organization_id: organizationId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to update user organization:', updateError);
        setError(translations.failedToJoinOrg);
        return;
      }

      setSuccess(true);
      setInviteCode('');
      
      // Reload page to update UI
      window.location.reload();
    } catch (error) {
      console.error('Failed to join organization:', error);
      setError(translations.failedToJoinOrg);
    } finally {
      await supabase.rpc('set_invite_code_context', { input_code: null });
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !organizationName.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const newInviteCode = generateInviteCode();

      // Create new organization
      const { data: org, error: createError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName.trim(),
          invite_code: newInviteCode.toUpperCase(),
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create organization:', createError);
        setError(translations.failedToCreateOrg);
        console.error('Detailed error:', createError);
        return;
      }

      // Update user's organization
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          organization_id: org.id,
          role: 'admin'  // First user becomes admin
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to update user organization:', updateError);
        setError(translations.failedToJoinOrg);
        return;
      }

      setSuccess(true);
      setOrganizationName('');
      
      // Reload page to update UI
      window.location.reload();
    } catch (error) {
      console.error('Failed to create organization:', error);
      setError(translations.failedToCreateOrg);
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error('Failed to copy invite code:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{translations.organization}</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
          {translations.successfullyJoinedOrg}
        </div>
      )}

      {user?.organization_id ? (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-md">
            {translations.alreadyInOrganization}
          </div>
          {user.invite_code && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translations.inviteCode}
              </label>
              <div className="flex items-center gap-2">
                <code className="px-2 py-1 bg-gray-100 rounded text-sm flex-1">
                  {user.invite_code}
                </code>
                <button
                  onClick={() => copyInviteCode(user.invite_code)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title={translations.copyInviteCode}
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <form onSubmit={handleCreateOrganization} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {translations.createNewOrganization}
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder={translations.enterOrganizationName}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !organizationName.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              {translations.createOrganization}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {translations.or}
              </span>
            </div>
          </div>

          <form onSubmit={handleJoinOrganization} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {translations.joinExistingOrganization}
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder={translations.enterInviteCode}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {translations.inviteCodeHelp}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inviteCode.trim()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? translations.joining : translations.joinOrganization}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};