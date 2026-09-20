# AWS Open-Source Local Integration

WebAI uses official **AWS Open-Source SDK modules & LocalStack** to run 100% locally on your machine with **zero cloud accounts, zero cloud setup, and zero cloud billing**.

## AWS Open-Source Components Used:

1. **AWS SDK Open-Source JS Client (`@aws-sdk/client-s3`)**: Used locally for archiving and managing generated application sandboxes.
2. **AWS LocalStack Open-Source Engine**: Intercepts AWS SDK calls locally on `http://localhost:4566` without connecting to any external cloud.
3. **Local Docker Environment**: Uses Docker Desktop locally on your laptop to run isolated sandbox containers (`db`, `backend`, `frontend`).

## Running Locally:

```bash
# Everything runs locally on your laptop!
npm run dev
```
