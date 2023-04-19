import { Redis } from "@upstash/redis";
import { isToolMode } from "util/env";

const redis = Redis.fromEnv();
export const revalidate = 60;

export const Stats = asyncComponent(async () => {
  const [reads, writes] = await redis
    .pipeline()
    .get("clip:metrics:reads")
    .get("clip:metrics:writes")
    .exec<[number, number]>();

  const stars = isToolMode() ? null : await fetch("https://api.github.com/repos/chronark/envshare")
    .then((res) => res.json())
    .then((json) => json.stargazers_count as number);

  const stats: { label: string; value: number }[] = [
    {
      label: "Documents Encrypted",
      value: writes,
    },
    {
      label: "Documents Decrypted",
      value: reads,
    },
  ];

  if (stars) {
    stats.push({
      label: "GitHub Stars",
      value: stars,
    });
  }

  return (
    <section className="container mx-auto">
      <ul className={`grid grid-cols-1 gap-4 ${ isToolMode() ? 'sm:grid-cols-2' : 'sm:grid-cols-3' }`}>
        {stats.map(({ label, value }) => (
          <li
            key={label}
            className="flex items-center justify-between gap-2 px-4 py-3 overflow-hidden rounded m sm:flex-col"
          >
            <dd className="text-2xl font-bold tracking-tight text-center sm:text-5xl text-zinc-200">
              {Intl.NumberFormat("en-US", { notation: "compact" }).format(value)}
            </dd>
            <dt className="leading-6 text-center text-zinc-500">{label}</dt>
          </li>
        ))}
      </ul>
    </section>
  );
});

// stupid hack to make "server components" actually work with components
// https://www.youtube.com/watch?v=h_9Vx6kio2s
function asyncComponent<T, R>(fn: (arg: T) => Promise<R>): (arg: T) => R {
  return fn as unknown as (arg: T) => R;
}
