import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createNewUser, sendInvitationEmail } from '../../firebase/functions'; // Import the typed callable function

// Define the component's props
interface InviteUserModalProps {
  currentUser: any; // Consider creating a more specific 'User' type
  onClose: () => void;
  onUserAdded: () => void;
}

// Define the form's state shape
interface FormDataState {
  name: string;
  email: string;
  password: string;
  role: string;
}

function InviteUserModal({ currentUser, onClose, onUserAdded }: InviteUserModalProps) {
  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    email: '',
    password: '',
    role: 'Developer'
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      // Call the Cloud Function with the required payload
      await createNewUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        organization: currentUser.organization,
      });

      await sendInvitationEmail({
        email: formData.email,
        name: formData.name,
      });

      onUserAdded(); // Refresh the user list in the parent component
      onClose(); // Close the modal on success
    } catch (err: any) {
      console.error("Error inviting user: ", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-gray-800 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500";
  const labelClasses = "block text-sm font-medium mb-2 text-gray-800 dark:text-dark-100";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-dark-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Invite Team Member</h2>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClasses}>Username</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputClasses} required />
            </div>
            <div>
              <label className={labelClasses}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClasses} required />
            </div>
            <div>
              <label className={labelClasses}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} className={inputClasses} required />
            </div>
            <div>
              <label className={labelClasses}>Role</label>
              <select name="role" value={formData.role} onChange={handleInputChange} className={inputClasses}>
                <option>Developer</option>
                <option>Designer</option>
                <option>Project Manager</option>
                <option>DevOps Engineer</option>
                <option>QA Engineer</option>
              </select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-800 dark:text-dark-100 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors duration-200">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:bg-primary-800 disabled:cursor-not-allowed">
                {isSubmitting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default InviteUserModal;
