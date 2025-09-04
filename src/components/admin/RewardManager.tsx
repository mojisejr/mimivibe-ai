"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/ToastContainer";

interface Reward {
  id: number;
  name: string;
  type: 'COINS' | 'FREE_POINTS' | 'STARS';
  value: number;
  criteria?: Record<string, any>;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RewardFormData {
  name: string;
  type: 'COINS' | 'FREE_POINTS' | 'STARS';
  value: number;
  description: string;
  isActive: boolean;
}

export function RewardManager() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [formData, setFormData] = useState<RewardFormData>({
    name: '',
    type: 'COINS',
    value: 0,
    description: '',
    isActive: true
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/rewards');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRewards(data.data.rewards);
        }
      } else {
        addToast({
          type: "error",
          message: "ไม่สามารถโหลดข้อมูลรางวัลได้",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      addToast({
        type: "error",
        message: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingReward ? '/api/admin/rewards' : '/api/admin/rewards';
      const method = editingReward ? 'PUT' : 'POST';
      const body = editingReward 
        ? { id: editingReward.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        addToast({
          type: "success",
          message: editingReward ? "อัปเดตรางวัลสำเร็จ" : "สร้างรางวัลใหม่สำเร็จ",
          duration: 3000
        });
        
        setShowForm(false);
        setEditingReward(null);
        setFormData({
          name: '',
          type: 'COINS',
          value: 0,
          description: '',
          isActive: true
        });
        fetchRewards();
      } else {
        addToast({
          type: "error",
          message: data.message || "เกิดข้อผิดพลาด",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Failed to save reward:', error);
      addToast({
        type: "error",
        message: "ไม่สามารถบันทึกข้อมูลได้",
        duration: 3000
      });
    }
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      type: reward.type,
      value: reward.value,
      description: reward.description || '',
      isActive: reward.isActive
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReward(null);
    setFormData({
      name: '',
      type: 'COINS',
      value: 0,
      description: '',
      isActive: true
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'COINS':
        return '🪙';
      case 'FREE_POINTS':
        return '🎁';
      case 'STARS':
        return '⭐';
      default:
        return '💎';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'COINS':
        return 'เหรียญ';
      case 'FREE_POINTS':
        return 'แต้มฟรี';
      case 'STARS':
        return 'ดาว';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-base-300 rounded"></div>
          <div className="h-20 bg-base-300 rounded"></div>
          <div className="h-20 bg-base-300 rounded"></div>
          <div className="h-20 bg-base-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-base-content">จัดการรางวัล</h2>
            <p className="text-sm text-base-content/60">ตั้งค่ารางวัลสำหรับกิจกรรมต่างๆ</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          เพิ่มรางวัล
        </button>
      </div>

      {/* Reward Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-base-100 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-bold text-base-content mb-4">
              {editingReward ? 'แก้ไขรางวัล' : 'เพิ่มรางวัลใหม่'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  ชื่อรางวัล
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="เช่น REFERRAL_REWARD"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  ประเภทรางวัล
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="select select-bordered w-full"
                >
                  <option value="COINS">🪙 เหรียญ</option>
                  <option value="FREE_POINTS">🎁 แต้มฟรี</option>
                  <option value="STARS">⭐ ดาว</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  จำนวน
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                  className="input input-bordered w-full"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  คำอธิบาย
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="textarea textarea-bordered w-full"
                  placeholder="คำอธิบายรางวัล (ไม่จำเป็น)"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="checkbox checkbox-primary"
                />
                <label className="text-sm text-base-content">เปิดใช้งาน</label>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-ghost flex-1"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  {editingReward ? 'อัปเดต' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Rewards List */}
      <div className="space-y-3">
        {rewards.length === 0 ? (
          <div className="text-center py-12 text-base-content/60">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <p className="text-lg">ยังไม่มีการตั้งค่ารางวัล</p>
            <p className="text-sm">เพิ่มรางวัลเพื่อเริ่มต้นระบบ gamification</p>
          </div>
        ) : (
          rewards.map((reward) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-4 bg-base-200/50 rounded-xl hover:bg-base-200/80 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl">
                  {getTypeIcon(reward.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-base-content">
                      {reward.name}
                    </h3>
                    {reward.isActive ? (
                      <div className="badge badge-success badge-sm">Active</div>
                    ) : (
                      <div className="badge badge-ghost badge-sm">Inactive</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-base-content/60">
                    <span>{reward.value} {getTypeName(reward.type)}</span>
                    {reward.description && (
                      <>
                        <span>•</span>
                        <span>{reward.description}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(reward)}
                  className="btn btn-sm btn-ghost"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}