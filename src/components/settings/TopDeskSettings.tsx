import React, { useState, useEffect } from 'react';
import { Twitch as Switch } from 'lucide-react';
import { topdeskService } from '../../services/topdesk';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { translations } from '../../utils/translations';

export const TopDeskSettings = () => {
  const { id: userId } = useCurrentUser();
  const [enabled, setEnabled] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, [userId]);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const config = await topdeskService.getConfig(userId);
      if (config) {
        setEnabled(config.enabled);
        setApiUrl(config.api_url || '');
        setApiKey(config.api_key || '');
      } else {
        setEnabled(false);
        setApiUrl('');
        setApiKey('');
      }
    } catch (err) {
      console.error('Failed to load TopDesk config:', err);
      setError(translations.failedToLoadConfig);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      setError(null);
      const success = await topdeskService.toggleEnabled(userId, !enabled);
      if (success) {
        setEnabled(!enabled);
      } else {
        setError(translations.failedToToggleTopDesk);
      }
    } catch (err) {
      console.error('Failed to toggle TopDesk integration:', err);
      setError(translations.failedToToggleTopDesk);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await topdeskService.updateConfig(userId, {
        api_url: apiUrl,
        api_key: apiKey
      });
    } catch (err) {
      console.error('Failed to update TopDesk config:', err);
      setError(translations.failedToUpdateConfig);
    }
  };

  if (isLoading) {
    return <div>{translations.loading}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{translations.topdeskIntegration}</h2>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span className="sr-only">
            {enabled ? translations.disable : translations.enable} TopDesk
          </span>
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {enabled && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {translations.topdeskApiUrl}
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://your-instance.topdesk.net"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {translations.topdeskApiKey}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {translations.saveChanges}
          </button>
        </form>
      )}
    </div>
  );
};