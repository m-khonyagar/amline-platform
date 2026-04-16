import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 25,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

const baseUrl = __ENV.AMLINE_BASE_URL || 'http://127.0.0.1:8080';

export default function () {
  const responses = [
    http.get(`${baseUrl}/api/health`),
    http.get(`${baseUrl}/api/ready`),
    http.get(`${baseUrl}/api/contracts?client=people&actorId=acct_1&teamId=team_north`),
    http.get(`${baseUrl}/api/contracts?client=advisor&actorId=adv_21&teamId=team_north`),
    http.get(`${baseUrl}/api/admin/audit-log?entityId=ct-1005`),
  ];

  responses.forEach((response) => {
    check(response, {
      'status is successful': (res) => res.status >= 200 && res.status < 400,
    });
  });

  sleep(1);
}
