"use client";

import React, { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import styles from "./GitHubContributions.module.css";

interface GitHubContributionsProps {
  username: string;
  months?: number;
}

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export default function GitHubContributions({ 
  username, 
  months = 8 
}: GitHubContributionsProps) {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch from GitHub Contributions API
        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}?y=last`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch contributions");
        }
        
        const data = await response.json();
        
        // Calculate date range (last N months)
        const now = new Date();
        const startDate = new Date();
        startDate.setMonth(now.getMonth() - months);
        startDate.setDate(1); // Start of month
        
        // Filter contributions to the specified date range
        const filteredContributions = data.contributions.filter((day: any) => {
          const dayDate = new Date(day.date);
          return dayDate >= startDate && dayDate <= now;
        });
        
        // Map to our format with levels
        const mappedContributions = filteredContributions.map((day: any) => ({
          date: day.date,
          count: day.count,
          level: day.count === 0 ? 0 : Math.min(4, Math.ceil(day.count / 5)),
        }));
        
        setContributions(mappedContributions);
      } catch (err) {
        console.error("Error fetching GitHub contributions:", err);
        setError("Error al cargar contribuciones");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchContributions();
    }
  }, [username, months]);

  // Group contributions by weeks
  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];
  
  contributions.forEach((day, index) => {
    const date = new Date(day.date);
    const dayOfWeek = date.getDay();
    
    // Start new week on Sunday or first day
    if (dayOfWeek === 0 || index === 0) {
      if (currentWeek.length > 0) {
        weeks.push(currentWeek);
      }
      currentWeek = [];
    }
    
    currentWeek.push(day);
  });
  
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

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
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>GITHUB</span>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          @{username}
          <ExternalLink className="h-3 w-3" />
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
                  title={`${day.date}: ${day.count} contribuciones`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
