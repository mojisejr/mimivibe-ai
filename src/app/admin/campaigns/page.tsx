"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/ToastContainer';
import { UnifiedNavbar } from '@/components/layout/UnifiedNavbar';

interface CampaignTemplate {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  rewards: any[];
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCampaignsPage() {
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { addToast } = useToast();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/campaigns');
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Admin access required');
        }
        throw new Error('Failed to fetch templates');
      }
      const result = await response.json();
      if (result.success) {
        setTemplates(result.data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError(error instanceof Error ? error.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const toggleTemplateActive = async (templateId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/campaigns/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentActive
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update template');
      }

      const result = await response.json();
      if (result.success) {
        addToast({
          type: 'success',
          message: `Template ${!currentActive ? 'activated' : 'deactivated'} successfully`,
          duration: 3000,
        });
        await fetchTemplates();
      }
    } catch (error) {
      console.error('Error updating template:', error);
      addToast({
        type: 'error',
        message: 'Failed to update template',
        duration: 3000,
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/campaigns/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      const result = await response.json();
      if (result.success) {
        addToast({
          type: 'success',
          message: 'Template deleted successfully',
          duration: 3000,
        });
        await fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      addToast({
        type: 'error',
        message: 'Failed to delete template',
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <UnifiedNavbar />
        <div className="pt-20 px-4 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-base-300 rounded w-1/4"></div>
              <div className="h-32 bg-base-300 rounded"></div>
              <div className="h-32 bg-base-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-100">
        <UnifiedNavbar />
        <div className="pt-20 px-4 pb-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="alert alert-error max-w-md mx-auto">
              <span>{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <UnifiedNavbar />
      <div className="pt-20 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-base-content">Campaign Management</h1>
              <p className="text-base-content/70 mt-2">
                Manage daily login campaign templates and configurations
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <span className="mr-2">➕</span>
              Create Template
            </button>
          </div>

          {/* Templates Grid */}
          <div className="grid gap-6">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-base-200 rounded-2xl p-6 border border-base-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-base-content">
                        {template.name}
                      </h3>
                      <div className="badge badge-outline">
                        {template.type}
                      </div>
                      <div className={`badge ${template.isActive ? 'badge-success' : 'badge-warning'}`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <p className="text-sm text-base-content/70 mb-3">
                      {template.metadata?.description || 'No description'}
                    </p>
                    
                    {/* Rewards Preview */}
                    <div className="bg-base-100 rounded-xl p-4">
                      <h4 className="font-semibold text-base-content mb-2">
                        Rewards ({template.rewards.length} configured)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {template.rewards.slice(0, 4).map((reward, index) => (
                          <div key={index} className="text-center p-2 bg-primary/10 rounded-lg">
                            <div className="text-xs text-primary font-bold">
                              Day {reward.day}
                            </div>
                            <div className="text-xs text-base-content/70">
                              {reward.exp} EXP, {reward.coins} 🪙
                              {reward.stars ? `, ${reward.stars} ⭐` : ''}
                            </div>
                          </div>
                        ))}
                        {template.rewards.length > 4 && (
                          <div className="text-center p-2 bg-base-300 rounded-lg">
                            <div className="text-xs text-base-content/70">
                              +{template.rewards.length - 4} more
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => toggleTemplateActive(template.id, template.isActive)}
                      className={`btn btn-sm ${template.isActive ? 'btn-warning' : 'btn-success'}`}
                    >
                      {template.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => setSelectedTemplate(template)}
                      className="btn btn-sm btn-outline"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="text-xs text-base-content/50 mt-4 pt-4 border-t border-base-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div>ID: {template.id}</div>
                    <div>Created: {new Date(template.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-base-content mb-2">
                No campaign templates found
              </h3>
              <p className="text-base-content/70 mb-4">
                Create your first campaign template to get started.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                Create Template
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Template Details Modal */}
      {selectedTemplate && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">{selectedTemplate.name}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Configuration</h4>
                <pre className="bg-base-200 p-4 rounded-lg text-sm overflow-auto max-h-40">
                  {JSON.stringify(selectedTemplate.metadata, null, 2)}
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Rewards</h4>
                <div className="max-h-60 overflow-auto">
                  <table className="table table-zebra table-compact w-full">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>EXP</th>
                        <th>Coins</th>
                        <th>Stars</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTemplate.rewards.map((reward, index) => (
                        <tr key={index}>
                          <td>{reward.day}</td>
                          <td>{reward.exp}</td>
                          <td>{reward.coins}</td>
                          <td>{reward.stars || 0}</td>
                          <td className="truncate max-w-xs">{reward.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="modal-action">
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}