import { redirect } from 'next/navigation';

/*
 * Root route of the authenticated app. Redirects to the Day page
 * (the current primary surface: feeling / doing / sharing tabs +
 * calming sounds).
 *
 * The old dashboard-style cockpit that used to live here can be
 * retrieved from git history if needed. The Day page is the right
 * home-screen for the V1 era.
 */
export default function RootAppPage(): never {
  redirect('/day');
}
