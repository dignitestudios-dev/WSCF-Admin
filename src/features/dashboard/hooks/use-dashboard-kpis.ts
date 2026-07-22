import { useQuery } from '@tanstack/react-query';
import { dashboardService, DashboardKPIsResponse } from '../services/dashboard.service';

export function useDashboardKPIs() {
  return useQuery<DashboardKPIsResponse, Error>({
    queryKey: ['dashboardKPIs'],
    queryFn: () => dashboardService.getKPIs(),
  });
}
