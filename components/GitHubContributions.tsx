"use client";

import React, { useEffect, useState } from "react";
import styles from "./GitHubContributions.module.css";

interface GitHubContributionsProps {
  username: string;
  months?: number;
}

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export default function GitHubContributions({ 
  username, 
  months = 4 
}: GitHubContributionsProps) {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use GitHub Contributions API
        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}?y=last`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch GitHub contributions");
        }

        const data = await response.json();
        
        // Get contributions from the last N months
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        
        // Filter contributions by date range
        const filteredContributions: ContributionDay[] = [];
        
        if (data.contributions && Array.isArray(data.contributions)) {
          data.contributions.forEach((contrib: any) => {
            const contribDate = new Date(contrib.date);
            if (contribDate >= startDate && contribDate <= endDate) {
              const count = contrib.count || 0;
              const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 9 ? 3 : 4;
              
              filteredContributions.push({
                date: contrib.date,
                count,
                level,
              });
            }
          });
        }

        // Fill in missing days to ensure continuous timeline
        const days: ContributionDay[] = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const existing = filteredContributions.find(c => c.date === dateStr);
          
          if (existing) {
            days.push(existing);
          } else {
            days.push({
              date: dateStr,
              count: 0,
              level: 0,
            });
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }

        setContributions(days);
      } catch (err) {
        console.error("Error fetching GitHub contributions:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [username, months]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando contribuciones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error al cargar contribuciones</div>
      </div>
    );
  }

  // Group contributions by week
  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }

  // Get month labels
  const monthLabels: string[] = [];
  const currentDate = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    monthLabels.push(date.toLocaleDateString('es-ES', { month: 'short' }));
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>GitHub</span>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          @{username} →
        </a>
      </div>
      <div className={styles.graph}>
        <div className={styles.weeks}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className={styles.week}>
              {week.map((day, dayIndex) => (
                <div
                  key={`${day.date}-${dayIndex}`}
                  className={`${styles.day} ${styles[`level${day.level}`]}`}
                  title={`${day.count} contribuciones el ${new Date(day.date).toLocaleDateString('es-ES')}`}
                  aria-label={`${day.count} contribuciones el ${new Date(day.date).toLocaleDateString('es-ES')}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
