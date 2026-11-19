/**
 * Package families — the curated layer on top of registry data. NuGet and npm know packages; this
 * file knows which category each one belongs to and how that category is presented.
 *
 * A package joins the family with the **longest** case-insensitive prefix matching its id (a NuGet id
 * or an npm name such as `@bielu/scalar-grpc`; one family can hold both), so a
 * specific family (`Bielu.AspNetCore.AsyncApi.Scalar`) wins over a broad one (`Bielu.AspNetCore.AsyncApi`)
 * regardless of declaration order. Declaration order is display order. Packages no family claims are
 * grouped automatically (see `autoFamilyFor` in catalog.ts), so curating here is optional polish.
 */

import type { FamilyIconName } from './family-icons';
import type { IllustrationName } from './illustrations';

export type Section = 'flagship' | 'search' | 'infrastructure' | 'libraries' | 'legacy';

export interface Family {
  /** URL slug, also used as the anchor on the index page. */
  slug: string;
  name: string;
  section: Section;
  /** Falls back to the most downloaded package's description when omitted. */
  summary?: string;
  prefixes: string[];
  repo?: string;
  docs?: string;
  /** Hand-drawn icon; takes precedence over {@link illustration}. */
  icon?: FamilyIconName;
  /** Tile artwork. When omitted the top package's NuGet icon is used, then a generic illustration. */
  illustration?: IllustrationName;
  /** Base hue (0–360) of the tile gradient. */
  hue?: number;
}

export const SECTIONS: Record<Section, { title: string; sub: string }> = {
  flagship: {
    title: 'API descriptions',
    sub: 'Code-first AsyncAPI, Arazzo and Overlay for ASP.NET Core — the OpenAPI developer experience, applied to everything else.',
  },
  search: {
    title: 'Search',
    sub: 'Bielu.BetterSearch, in beta: one query model for every search engine, so switching engines is a configuration change.',
  },
  infrastructure: {
    title: 'Messaging & infrastructure',
    sub: 'Durable delivery, orchestration and secrets — the plumbing under distributed .NET systems.',
  },
  libraries: {
    title: 'Libraries & developer tooling',
    sub: 'Smaller pieces that keep the rest of the ecosystem consistent.',
  },
  legacy: {
    title: 'Legacy',
    sub: 'Examine providers, the original search module and Umbraco packages. Still on NuGet, no longer actively developed.',
  },
};

const API_DESCRIPTIONS = {
  repo: 'https://github.com/bielu/Bielu.AspNetCore.AsyncApi',
  docs: 'https://apidescriptions.bielu.pl/',
};

const BETTER_SEARCH = {
  section: 'search',
  repo: 'https://github.com/bielu/bielu.bettersearch',
  docs: 'https://search.bielu.pl/',
} as const;

export const FAMILIES: Family[] = [
  // ---- API descriptions -------------------------------------------------------------------
  {
    slug: 'asyncapi',
    name: 'AsyncAPI',
    section: 'flagship',
    summary:
      'Code-first AsyncAPI 2.6 / 3.1 documents for ASP.NET Core — attributes or fluent API, transformers, versioning, merging and Native AOT.',
    prefixes: ['Bielu.AspNetCore.AsyncApi'],
    hue: 255,
    ...API_DESCRIPTIONS,
  },
  {
    slug: 'protocol-bindings',
    name: 'Protocol bindings',
    section: 'flagship',
    summary: 'Describe SignalR hubs, gRPC services, Server-Sent Events and WebRTC data channels in AsyncAPI.',
    prefixes: ['Bielu.AspNetCore.AsyncApi.Extensions.Protocols'],
    icon: 'protocol-bindings',
    hue: 190,
    ...API_DESCRIPTIONS,
  },
  {
    slug: 'scalar-consoles',
    name: 'Scalar consoles',
    section: 'flagship',
    summary:
      'Interactive SignalR, gRPC-Web and Kafka/MQTT/AMQP consoles inside the Scalar API reference: NuGet packages with Aspire variants, and npm plugins for any Scalar host.',
    prefixes: ['Bielu.AspNetCore.AsyncApi.Scalar', '@bielu/scalar-'],
    icon: 'scalar-consoles',
    hue: 160,
    ...API_DESCRIPTIONS,
  },
  {
    slug: 'arazzo',
    name: 'Arazzo',
    section: 'flagship',
    summary:
      'Arazzo workflow object model, readers and validation, ASP.NET Core integration that wires workflows to your live API documents, and a Scalar plugin that renders them.',
    prefixes: ['Bielu.Arazzo.', 'Bielu.AspNetCore.Arazzo', '@bielu/scalar-arazzo'],
    icon: 'arazzo',
    hue: 320,
    ...API_DESCRIPTIONS,
  },
  {
    slug: 'overlay',
    name: 'Overlay',
    section: 'flagship',
    summary: 'OpenAPI Overlay 1.0 / 1.1 engine that applies to OpenAPI, AsyncAPI and Arazzo documents alike.',
    prefixes: ['Bielu.Overlay.', 'Bielu.AspNetCore.AsyncApi.Overlay', 'Bielu.AspNetCore.Arazzo.Overlay'],
    icon: 'overlay',
    hue: 25,
    ...API_DESCRIPTIONS,
  },
  {
    slug: 'api-tooling',
    name: 'CLI & build tooling',
    section: 'flagship',
    summary: 'dotnet tools, dotnet new templates and build-time document generation shared by every spec family.',
    prefixes: [
      'Bielu.AspNetCore.AsyncApi.Cli',
      'Bielu.AspNetCore.AsyncApi.Templates',
      'Bielu.AspNetCore.AsyncApi.ApiDescription.Server',
      'Bielu.AspNetCore.ApiDescriptions',
      'Bielu.Spec.Shared',
      'Bielu.Cli.Shared',
    ],
    icon: 'api-tooling',
    hue: 220,
    ...API_DESCRIPTIONS,
  },

  // ---- Search ------------------------------------------------------------------------------
  // Slugs match the Bielu.BetterSearch parts on bielu.pl, which link to them as anchors.
  {
    slug: 'bettersearch',
    name: 'BetterSearch',
    summary:
      'A provider-agnostic search abstraction for .NET: one query model with Lucene semantics, a fluent builder, and errors returned as results.',
    prefixes: ['Bielu.BetterSearch.'],
    hue: 175,
    ...BETTER_SEARCH,
  },
  {
    slug: 'bettersearch-elasticsearch',
    name: 'Elasticsearch provider',
    summary: 'Runs BetterSearch queries on Elasticsearch, with paging, sorting, post filters, highlighting and scores.',
    prefixes: ['Bielu.BetterSearch.ElasticSearch'],
    illustration: 'search',
    hue: 195,
    ...BETTER_SEARCH,
  },
  {
    slug: 'bettersearch-opensearch',
    name: 'OpenSearch provider',
    summary: 'Runs BetterSearch queries on OpenSearch, with paging, sorting, post filters, highlighting, scores and basic or API-key auth.',
    prefixes: ['Bielu.BetterSearch.OpenSearch'],
    illustration: 'globe',
    hue: 215,
    ...BETTER_SEARCH,
  },
  {
    slug: 'bettersearch-meilisearch',
    name: 'Meilisearch provider',
    summary: 'Runs BetterSearch queries on Meilisearch, translating raw Lucene queries into filters where it can.',
    prefixes: ['Bielu.BetterSearch.Meilisearch'],
    illustration: 'spark',
    hue: 330,
    ...BETTER_SEARCH,
  },
  {
    slug: 'bettersearch-lifti',
    name: 'In-memory provider',
    summary: 'An in-process BetterSearch index on LIFTI, with no server to run.',
    prefixes: ['Bielu.BetterSearch.Lifti'],
    illustration: 'layers',
    hue: 45,
    ...BETTER_SEARCH,
  },
  {
    slug: 'bettersearch-lucene',
    name: 'Lucene.NET provider',
    summary: 'In memory or on disk, replacing the LIFTI provider on the way to 1.0.',
    prefixes: ['Bielu.BetterSearch.Lucene'],
    illustration: 'book',
    hue: 120,
    ...BETTER_SEARCH,
  },

  // ---- Messaging & infrastructure ----------------------------------------------------------
  {
    slug: 'persistent-queues',
    name: 'Persistent Queues',
    section: 'infrastructure',
    summary: 'High-performance store-and-forward message queue with LMDB and ZoneTree storage and OpenTelemetry metrics.',
    prefixes: ['Bielu.PersistentQueues'],
    repo: 'https://github.com/bielu/Bielu.PersistentQueues',
    hue: 215,
  },
  {
    slug: 'orchestrator',
    name: 'Microservices Orchestrator',
    section: 'infrastructure',
    summary: 'One abstraction over Docker, Podman, containerd and Kubernetes — swap the runtime with a line of config.',
    prefixes: ['Bielu.Microservices.Orchestrator'],
    repo: 'https://github.com/bielu/bielu.microservices.orchestrator',
    icon: 'orchestrator',
    hue: 200,
  },
  {
    slug: 'aspire',
    name: 'Aspire extensions',
    section: 'infrastructure',
    summary: '.NET Aspire resources plus 1Password and Infisical secret integrations for local and CI topologies.',
    prefixes: ['Bielu.Aspire.'],
    repo: 'https://github.com/bielu/Bielu.Aspire.Common',
    illustration: 'spark',
    hue: 275,
  },
  {
    slug: 'onepassword',
    name: '1Password secrets',
    section: 'infrastructure',
    summary: '1Password Connect secrets provider for Microsoft.Extensions.Configuration.',
    prefixes: ['Bielu.OnePassword'],
    repo: 'https://github.com/bielu/Bielu.OnePassword.AspNetCore.Configuration.Secrets',
    illustration: 'key',
    hue: 45,
  },

  // ---- Libraries & developer tooling -------------------------------------------------------
  {
    slug: 'entityframework',
    name: 'EF Core versioning',
    section: 'libraries',
    summary: 'Provider-agnostic content versioning for EF Core — no temporal tables, triggers or provider SQL.',
    prefixes: ['Bielu.EntityFramework.'],
    repo: 'https://github.com/bielu/bielu.entityframework.extensions',
    illustration: 'database',
    hue: 140,
  },
  {
    slug: 'identity',
    name: 'LDAP identity',
    section: 'libraries',
    summary: 'LDAP identity provider for ASP.NET Core — OpenLDAP or Active Directory, no local database.',
    prefixes: ['Bielu.AspNetCore.Identity'],
    repo: 'https://github.com/bielu/bielu.aspnetcore.identity',
    illustration: 'badge',
    hue: 10,
  },
  {
    slug: 'analyzers',
    name: 'Static code analyzers',
    section: 'libraries',
    summary: 'Roslyn analyzers enforcing the conventions used across the bielu ecosystem.',
    prefixes: ['Bielu.StaticCode.'],
    repo: 'https://github.com/bielu/bielu.staticcode.analyzers',
    icon: 'analyzers',
    hue: 290,
  },
  {
    slug: 'common',
    name: 'Common libraries',
    section: 'libraries',
    summary: 'Shared building blocks — decorator registration helpers and Kiota client utilities.',
    prefixes: ['Bielu.Common.'],
    repo: 'https://github.com/bielu/Bielu.Common.Libraries',
    illustration: 'blocks',
    hue: 235,
  },
  {
    slug: 'tdsharp',
    name: 'TDSharp extensions',
    section: 'libraries',
    summary: 'Client factory, resilience, logging and OpenTelemetry extensions for TDSharp.',
    prefixes: ['bielu.tdsharp.'],
    repo: 'https://github.com/bielu/bielu.tdsharp.extensions',
    illustration: 'plane',
    hue: 200,
  },
  {
    slug: 'schema-generator',
    name: 'Schema generator',
    section: 'libraries',
    summary: 'JSON schema generation at build time.',
    prefixes: ['bielu.SchemaGenerator.'],
    repo: 'https://github.com/bielu/bielu.schema.generator',
    illustration: 'braces',
    hue: 170,
  },
  {
    slug: 'serilog',
    name: 'Serilog sinks',
    section: 'libraries',
    summary: 'Serilog sink for Google Cloud Logging with lazy initialisation.',
    prefixes: ['Serilog.Sinks.'],
    repo: 'https://github.com/bielu/serilog-sinks-lazygooglecloudlogging',
    illustration: 'logs',
    hue: 350,
  },

  // ---- Legacy ------------------------------------------------------------------------------
  {
    slug: 'examine',
    name: 'Examine providers',
    section: 'legacy',
    summary: 'Elasticsearch-backed Examine providers for Umbraco, including the original Novicell packages.',
    prefixes: ['Bielu.Examine.', 'Novicell.Examine.'],
    repo: 'https://github.com/bielu/bielu.examine.providers',
    illustration: 'search',
    hue: 30,
  },
  {
    slug: 'search-module',
    name: 'SImpl.SearchModule',
    section: 'legacy',
    summary: 'Search abstraction with Elasticsearch, Examine and fluent-API implementations.',
    prefixes: ['SImpl.SearchModule.'],
    illustration: 'search',
    hue: 60,
  },
  {
    slug: 'umbraco-cdn',
    name: 'Umbraco CDN',
    section: 'legacy',
    summary: 'CDN cache purging for Umbraco — Cloudflare, Akamai, Azure CDN / Front Door and CloudFront.',
    prefixes: ['bielu.Umbraco.Cdn', 'bielu.cdn.'],
    repo: 'https://github.com/bielu/bielu.Umbraco.Cdn',
    illustration: 'globe',
    hue: 195,
  },
  {
    slug: 'umbraco-generators',
    name: 'Umbraco generators',
    section: 'legacy',
    summary: 'Source generator for strongly-typed Umbraco dictionary items.',
    prefixes: ['Bielu.Umbraco.'],
    repo: 'https://github.com/bielu/Bielu.Umbraco.Generators.Dictionaries',
    illustration: 'book',
    hue: 250,
  },
];
