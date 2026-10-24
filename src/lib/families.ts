/**
 * Package families — the curated layer on top of NuGet data. NuGet knows packages; this file
 * knows which category each one belongs to and how that category is presented.
 *
 * A package joins the family with the **longest** case-insensitive prefix matching its id, so a
 * specific family (`Bielu.AspNetCore.AsyncApi.Scalar`) wins over a broad one (`Bielu.AspNetCore.AsyncApi`)
 * regardless of declaration order. Declaration order is display order. Packages no family claims are
 * grouped automatically (see `autoFamilyFor` in catalog.ts), so curating here is optional polish.
 */

import type { FamilyIconName } from './family-icons';
import type { IllustrationName } from './illustrations';

export type Section = 'flagship' | 'infrastructure' | 'libraries' | 'legacy';

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
    sub: 'Search, indexing and Umbraco packages. Still on NuGet, no longer actively developed.',
  },
};

const API_DESCRIPTIONS = {
  repo: 'https://github.com/bielu/Bielu.AspNetCore.AsyncApi',
  docs: 'https://apidescriptions.bielu.pl/',
};

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
    summary: 'Interactive SignalR, gRPC-Web and Kafka/MQTT/AMQP consoles inside the Scalar API reference, with Aspire variants.',
    prefixes: ['Bielu.AspNetCore.AsyncApi.Scalar'],
    icon: 'scalar-consoles',
    hue: 160,
    ...API_DESCRIPTIONS,
  },
  {
    slug: 'arazzo',
    name: 'Arazzo',
    section: 'flagship',
    summary: 'Arazzo workflow object model, readers and validation, plus ASP.NET Core integration that wires workflows to your live API documents.',
    prefixes: ['Bielu.Arazzo.', 'Bielu.AspNetCore.Arazzo'],
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
