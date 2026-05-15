import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getDb } from '@/lib/db/client';

export type FieldEntry = {
  emotionName: string;
  emotionColor: string;
  count: number;
  trend: 'up' | 'down' | 'flat';
};

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const db = getDb();

    const rows = await db.execute<{
      emotion_name: string;
      emotion_color: string;
      current_count: number;
      yesterday_count: number;
    }>(sql`
      SELECT
        emotion_name,
        MAX(emotion_color) AS emotion_color,
        COUNT(*) FILTER (
          WHERE created_at >= NOW() - INTERVAL '6 hours'
        )::int AS current_count,
        COUNT(*) FILTER (
          WHERE created_at >= NOW() - INTERVAL '30 hours'
            AND created_at < NOW() - INTERVAL '24 hours'
        )::int AS yesterday_count
      FROM check_ins
      WHERE
        user_id = ${user.id}::uuid
        AND
        emotion_name IS NOT NULL
        AND created_at >= NOW() - INTERVAL '30 hours'
      GROUP BY emotion_name
      HAVING COUNT(*) FILTER (
        WHERE created_at >= NOW() - INTERVAL '6 hours'
      ) > 0
      ORDER BY current_count DESC
      LIMIT 10
    `);

    const entries: FieldEntry[] = rows.map((r) => {
      const curr = r.current_count ?? 0;
      const prev = r.yesterday_count ?? 0;
      let trend: FieldEntry['trend'] = 'flat';
      if (curr > prev + 1) trend = 'up';
      else if (curr < prev - 1) trend = 'down';
      return {
        emotionName: r.emotion_name,
        emotionColor: r.emotion_color ?? '#C4A060',
        count: curr,
        trend,
      };
    });

    return NextResponse.json(entries);
  });
}
