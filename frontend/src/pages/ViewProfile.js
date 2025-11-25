import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const ViewProfile = () => {
	const { id } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const [admin, setAdmin] = useState(location.state?.admin || null);

	useEffect(() => {
		if (admin) return;
		const stored = JSON.parse(localStorage.getItem('admins')) || [];
		const found = stored.find(a => (a.id || a._id || String(stored.indexOf(a))) === id);
		if (found) setAdmin(found);
	}, [admin, id]);

	if (!admin) {
		return (
			<div className="p-6">
				<div className="text-lg font-semibold">Profile not found</div>
				<button onClick={() => navigate(-1)} className="mt-4 px-3 py-2 bg-blue-600 text-white rounded">Go back</button>
			</div>
		);
	}

	return (
		<div className="ml-64 mt-12 p-4">
			<div className="flex items-start gap-6">
				<div className="w-36 h-36 rounded-full overflow-hidden bg-white-100 flex items-center justify-center">
					{admin.image ? (
						<img src={admin.image} alt="profile" className="w-full h-full object-cover" />
					) : (
						<div className="bg-blue-600 text-white w-full h-full flex items-center justify-center text-3xl font-semibold">
							{(admin.firstName?.[0] || '?').toUpperCase()}{(admin.lastName?.[0] || '').toUpperCase()}
						</div>
					)}
				</div>

				<div>
					<h1 className="text-2xl font-semibold">{admin.firstName} {admin.lastName}</h1>
					<div className="text-sm text-gray-600 mt-1">{admin.role || 'Admin'}</div>

					<div className="mt-4 space-y-2 text-sm">
						<div><strong>Email:</strong> {admin.email}</div>
						<div><strong>Phone:</strong> {admin.phone}</div>
						<div><strong>Department:</strong> {admin.department}</div>
						<div><strong>Date of Birth:</strong> {admin.dateofbirth || admin.dateOfBirth || '-'}</div>
					</div>

					<div className="mt-6 flex gap-3">
						<button onClick={() => navigate(`/profile/edit`, { state: { admin } })} className="px-4 py-2 bg-green-600 text-white rounded">Edit</button>
						<button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 rounded">Close</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ViewProfile;
