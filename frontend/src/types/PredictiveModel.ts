export interface PredictiveModel {
  predictive_model_id: string;
  model_name: string;
  model_version: string;
  model_type: string;
  status: string;
  accuracy_score?: number | null;
  auc_roc_score?: number | null;
  training_record_count: number;
  trained_at: string;
  deployed_at?: string | null;
  model_artifact?: string | null;
  created_at: string;
  updated_at: string;
}

export type PredictiveModelCreateInput = Omit<PredictiveModel, 'predictive_model_id'>;
export type PredictiveModelUpdateInput = Partial<PredictiveModelCreateInput>;
