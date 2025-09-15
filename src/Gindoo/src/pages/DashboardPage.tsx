// File: web/gindoo/src/pages/DashboardPage.tsx

import { useState, useMemo, useEffect } from 'react';
import { UserFilter } from '../components/UserFilter';
//import type { User } from '../types';

interface LeaderboardEntry {
    name: string;
    completed_count: number;
}

export const DashboardPage = () => {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);

    // Memoize chart URLs to prevent re-fetching on every render
    const taskStatusChartUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (selectedUserId) params.append('assigneeId', selectedUserId);
        params.append('t', Date.now().toString()); // Cache buster
        return `/gindoo/api/dashboard/stats?${params.toString()}`;
    }, [selectedUserId]);

    const tasksByAssigneeChartUrl = `/gindoo/api/dashboard/tasks-by-assignee?t=${Date.now()}`;

    // Fetch leaderboard data
    useEffect(() => {
        setIsLoadingLeaderboard(true);
        fetch('/gindoo/api/dashboard/leaderboard', { credentials: 'include' })
            .then(res => res.json())
            .then((data: LeaderboardEntry[]) => setLeaderboard(data))
            .catch(err => console.error("Failed to load leaderboard", err))
            .finally(() => setIsLoadingLeaderboard(false));
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
                <div className="w-48">
                    <UserFilter selectedUserId={selectedUserId} onChange={setSelectedUserId} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Task Distribution */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-semibold text-lg text-gray-800 mb-4">Task Distribution</h3>
                    <div className="flex justify-center items-center">
                        <img src={taskStatusChartUrl} alt="Task distribution chart" />
                    </div>
                </div>

                {/* Column 2: Tasks by Assignee */}
                <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
                    <h3 className="font-semibold text-lg text-gray-800 mb-4">Total Tasks per User</h3>
                     <div className="flex justify-center items-center">
                        <img src={tasksByAssigneeChartUrl} alt="Tasks by assignee chart" />
                    </div>
                </div>

                {/* Column 3: Leaderboard */}
                <div className="bg-white p-6 rounded-lg shadow lg:col-span-3">
                    <h3 className="font-semibold text-lg text-gray-800 mb-4">Completed Task Leaderboard</h3>
                    {isLoadingLeaderboard ? (
                        <p>Loading leaderboard...</p>
                    ) : (
                        <ol className="divide-y divide-gray-200">
                            {leaderboard.map((user, index) => (
                                <li key={user.name} className="py-3 flex justify-between items-center">
                                    <span className="font-medium text-gray-700">{index + 1}. {user.name}</span>
                                    <span className="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{user.completed_count} done</span>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>
        </div>
    );
};
