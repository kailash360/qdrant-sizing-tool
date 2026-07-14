import { DOCS } from '../lib/docs'
import type { Quantization, SizingConfig, VectorDatatype } from '../lib/types'
import { NumberField, PlacementToggle, SelectField } from './ui/fields'

interface InputPanelProps {
  config: SizingConfig
  onChange: (patch: Partial<SizingConfig>) => void
  onReset: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
      <legend className="px-1 text-[11px] font-semibold uppercase tracking-widest text-rose-400">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

export function InputPanel({ config, onChange, onReset }: InputPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Inputs</h2>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400 transition-colors hover:border-rose-400 hover:text-rose-400"
        >
          Reset
        </button>
      </div>

      <Section title="Dataset">
        <NumberField
          label="Number of vectors"
          value={config.numVectors}
          onChange={(numVectors) => onChange({ numVectors })}
          min={1}
          tooltip="Total number of points (vectors) stored in the collection across all shards."
          docLabel={DOCS.capacityPlanning.label}
          docUrl={DOCS.capacityPlanning.url}
        />
        <NumberField
          label="Vector dimension"
          value={config.dimension}
          onChange={(dimension) => onChange({ dimension })}
          min={1}
          tooltip="Dimensionality of each vector, determined by your embedding model (e.g. 1536 for OpenAI text-embedding-3-small)."
          docLabel={DOCS.capacityPlanning.label}
          docUrl={DOCS.capacityPlanning.url}
        />
        <SelectField<VectorDatatype>
          label="Vector datatype"
          value={config.datatype}
          onChange={(datatype) => onChange({ datatype })}
          options={[
            { value: 'float32', label: 'Float32 (4 bytes/dim)' },
            { value: 'float16', label: 'Float16 (2 bytes/dim)' },
          ]}
          tooltip="Storage datatype of the original vectors. Float16 halves storage with minor precision loss."
          docLabel={DOCS.storage.label}
          docUrl={DOCS.storage.url}
        />
        <NumberField
          label="Average payload size"
          value={config.payloadBytes}
          onChange={(payloadBytes) => onChange({ payloadBytes })}
          min={0}
          suffix="bytes"
          tooltip="Average size of the JSON payload attached to each point (metadata such as text, tags, timestamps)."
          docLabel={DOCS.storage.label}
          docUrl={DOCS.storage.url}
        />
      </Section>

      <Section title="Replication & Sharding">
        <NumberField
          label="Replication factor"
          value={config.replicationFactor}
          onChange={(replicationFactor) => onChange({ replicationFactor })}
          min={1}
          tooltip="Number of copies of each shard. Multiplies total RAM and disk. Use ≥2 for high availability."
          docLabel={DOCS.distributedDeployment.label}
          docUrl={DOCS.distributedDeployment.url}
        />
        <NumberField
          label="Number of shards"
          value={config.shards}
          onChange={(shards) => onChange({ shards })}
          min={1}
          tooltip="Shards split the collection across nodes. Qdrant recommends a multiple of the node count."
          docLabel={DOCS.distributedDeployment.label}
          docUrl={DOCS.distributedDeployment.url}
        />
        <NumberField
          label="Node RAM budget"
          value={config.nodeRamGib}
          onChange={(nodeRamGib) => onChange({ nodeRamGib })}
          min={1}
          suffix="GiB"
          tooltip="RAM available per node, used to derive the recommended node count."
          docLabel={DOCS.capacityPlanning.label}
          docUrl={DOCS.capacityPlanning.url}
        />
      </Section>

      <Section title="HNSW Index">
        <NumberField
          label="M (graph neighbors)"
          value={config.hnswM}
          onChange={(hnswM) => onChange({ hnswM })}
          min={0}
          tooltip={
            <span>
              Maximum number of graph neighbors per point. Controls the number of neighbors stored
              in the HNSW graph. Increasing M:
              <br />✓ Better recall
              <br />✓ More memory
              <br />✓ Longer build time
            </span>
          }
          docLabel={DOCS.indexing.label}
          docUrl={DOCS.indexing.url}
        />
        <NumberField
          label="ef_construct"
          value={config.efConstruct}
          onChange={(efConstruct) => onChange({ efConstruct })}
          min={1}
          tooltip="Number of candidate neighbors considered during index construction. Affects build time and recall, not storage size."
          docLabel={DOCS.indexing.label}
          docUrl={DOCS.indexing.url}
        />
        <PlacementToggle
          label="Graph storage location"
          value={config.hnswPlacement}
          onChange={(hnswPlacement) => onChange({ hnswPlacement })}
          tooltip="Where the HNSW graph is served from. Keeping it in RAM avoids disk I/O on every graph hop."
          docLabel={DOCS.indexing.label}
          docUrl={DOCS.indexing.url}
        />
      </Section>

      <Section title="Quantization">
        <SelectField<Quantization>
          label="Quantization mode"
          value={config.quantization}
          onChange={(quantization) => onChange({ quantization })}
          options={[
            { value: 'none', label: 'None' },
            { value: 'binary', label: 'Binary (1 bit/dim, 32×)' },
            { value: 'scalar', label: 'Scalar int8 (1 byte/dim, 4×)' },
          ]}
          tooltip="Binary quantization stores a compressed representation of vectors used during ANN traversal, dramatically reducing RAM usage. Original vectors are used later for rescoring."
          docLabel={DOCS.largeScaleSearch.label}
          docUrl={DOCS.largeScaleSearch.url}
        />
        <PlacementToggle
          label="Original vectors"
          value={config.originalVectorsPlacement}
          onChange={(originalVectorsPlacement) => onChange({ originalVectorsPlacement })}
          tooltip="Where full-precision vectors live. With quantization enabled they are only needed for rescoring and can usually move to disk."
          docLabel={DOCS.largeScaleSearch.label}
          docUrl={DOCS.largeScaleSearch.url}
        />
        <PlacementToggle
          label="Quantized vectors"
          value={config.quantizedVectorsPlacement}
          onChange={(quantizedVectorsPlacement) => onChange({ quantizedVectorsPlacement })}
          disabled={config.quantization === 'none'}
          tooltip="Where the compressed traversal copy lives. Keep in RAM — it is small and accessed constantly during search."
          docLabel={DOCS.quantization.label}
          docUrl={DOCS.quantization.url}
        />
      </Section>

      <Section title="Payload">
        <PlacementToggle
          label="Payload storage"
          value={config.payloadPlacement}
          onChange={(payloadPlacement) => onChange({ payloadPlacement })}
          tooltip="Where point payloads (metadata JSON) are stored. On-disk payload storage is recommended for large payloads."
          docLabel={DOCS.storage.label}
          docUrl={DOCS.storage.url}
        />
        <NumberField
          label="Indexed payload fields"
          value={config.indexedFields}
          onChange={(indexedFields) => onChange({ indexedFields })}
          min={0}
          tooltip="Number of payload fields with a payload index. Payload indexes accelerate metadata filtering by extending the HNSW graph during filtered search."
          docLabel={DOCS.payloadIndex.label}
          docUrl={DOCS.payloadIndex.url}
        />
        <PlacementToggle
          label="Payload index"
          value={config.payloadIndexPlacement}
          onChange={(payloadIndexPlacement) => onChange({ payloadIndexPlacement })}
          disabled={config.indexedFields === 0}
          tooltip="Payload indexes enable efficient metadata filtering. They extend the HNSW graph for single-pass filtered search."
          docLabel={DOCS.overview.label}
          docUrl={DOCS.overview.url}
        />
      </Section>
    </div>
  )
}
