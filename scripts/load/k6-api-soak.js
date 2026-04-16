import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    ramp_contract_reads: {
      executor: 'ramping-vus',
      startVUs: 50,
      stages: [
        { duration: '2m', target: 500 },
        { duration: '5m', target: 1500 },
        { duration: '10m', target: 1500 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
  },
};

const baseUrl = __ENV.AMLINE_BASE_URL || 'http://127.0.0.1:8080';

export default function () {
  const routeSet = [
    `${baseUrl}/api/health`,
    `${baseUrl}/api/contracts?client=people&actorId=acct_1&teamId=team_north`,
    `${baseUrl}/api/contracts/ct-1002?client=people&actorId=acct_1&teamId=team_north`,
    `${baseUrl}/api/contracts?client=advisor&actorId=adv_21&teamId=team_north`,
    `${baseUrl}/api/contracts/ct-1005?client=ops&actorId=ops_1&teamId=ops_central`,
    `${baseUrl}/api/admin/review-queue`,
    `${baseUrl}/api/admin/audit-log?entityId=ct-1005`,
  ];

  const response = http.get(routeSet[Math.floor(Math.random() * routeSet.length)], {
    headers: {
      'X-Request-Id': `k6-${__VU}-${__ITER}`,
    },
  });

  check(response, {
    'status is successful': (res) => res.status >= 200 && res.status < 400,
  });

  sleep(1);
}
