type ContributionDay = {
  date: string;
  contributionCount: number;
  color: string;
};

type ContributionWeek = {
  contributionDays: ContributionDay[];
};

const GRAPHQL_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
      }
    }
  }
`;

const LEGEND_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

export default async function ContributionGraph() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return (
      <div className="contrib-card">
        <p className="contrib-error">GitHub token not configured.</p>
      </div>
    );
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GRAPHQL_QUERY,
        variables: { login: "zamiel01" },
      }),
      next: { revalidate: 3600 },
    });

    const json = await res.json();
    const calendar =
      json?.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      return (
        <div className="contrib-card">
          <p className="contrib-error">Unable to load contributions.</p>
        </div>
      );
    }

    const weeks: ContributionWeek[] = calendar.weeks;

    return (
      <div className="contrib-card">
        <div className="contrib-scroll">
          <div className="contrib-grid">
            {weeks.map((week, wi) => (
              <div className="contrib-week" key={wi}>
                {week.contributionDays.map((day) => (
                  <span
                    key={day.date}
                    className="contrib-cell"
                    style={{ backgroundColor: day.color }}
                    title={`${day.contributionCount} contribution${day.contributionCount === 1 ? "" : "s"} on ${day.date}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="contrib-footer">
          <span>{calendar.totalContributions} contributions in the last year</span>
          <span className="contrib-legend">
            <span className="contrib-legend-label">Less</span>
            {LEGEND_COLORS.map((color) => (
              <span
                key={color}
                className="contrib-cell contrib-legend-cell"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="contrib-legend-label">More</span>
          </span>
        </div>
      </div>
    );
  } catch {
    return (
      <div className="contrib-card">
        <p className="contrib-error">Unable to load contributions.</p>
      </div>
    );
  }
}