export const DISABLED_SOURCE_ADAPTER_CONTRACT = Object.freeze({
  schemaVersion: 'amos_disabled_source_adapter.v0_1',
  status: 'disabled_proposal',
  enabled: false,
  liveRuntime: false,
  importsRuntime: false,
  canCallModel: false,
  canUseNetwork: false,
  canWriteDurableMemory: false,
  canChangeRoute: false,
  canChangeGateway: false,
  canDeployPublicAsset: false,
  canExecuteArbitraryUi: false,
  allowedActions: Object.freeze(['project_local_ui_harness_receipt']),
  blockedActions: Object.freeze([
    'call_model',
    'fetch_network',
    'write_durable_memory',
    'change_route',
    'change_gateway',
    'deploy_public_asset',
    'execute_arbitrary_ui',
  ]),
});

export function assertDisabledSourceAdapter() {
  if (DISABLED_SOURCE_ADAPTER_CONTRACT.enabled !== false) {
    throw new Error('AMOS disabled source adapter must remain disabled.');
  }
  if (DISABLED_SOURCE_ADAPTER_CONTRACT.liveRuntime !== false) {
    throw new Error('AMOS disabled source adapter is not live runtime wiring.');
  }
  return true;
}

export function createDisabledSourceAdapterProjection(uiHarnessReceipt) {
  assertDisabledSourceAdapter();

  const receipt = uiHarnessReceipt?.ui_harness_receipt || {};
  const runtime = receipt.runtime_adapter_result || {};
  const projection = receipt.ui_projection || {};

  return Object.freeze({
    schemaVersion: DISABLED_SOURCE_ADAPTER_CONTRACT.schemaVersion,
    status: DISABLED_SOURCE_ADAPTER_CONTRACT.status,
    enabled: DISABLED_SOURCE_ADAPTER_CONTRACT.enabled,
    performedLiveAction: false,
    route: projection.route || '/app/',
    surface: projection.surface || 'consumer_app',
    entryQuestion: projection.entry_question || 'What do you want?',
    runtimeResult: runtime.result || 'not_run',
    inputHash: runtime.input_hash || '',
    blockedActions: [...DISABLED_SOURCE_ADAPTER_CONTRACT.blockedActions],
  });
}
