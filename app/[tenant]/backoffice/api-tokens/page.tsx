import { getApiTokensAction } from '@/actions/api-tokens.actions';
import { ApiTokensClientView } from '@/components/admin/ApiTokensClientView';

export default async function ApiTokensPage() {
  const result = await getApiTokensAction();

  return (
    <ApiTokensClientView initialTokens={result.success ? result.data : []} />
  );
}
