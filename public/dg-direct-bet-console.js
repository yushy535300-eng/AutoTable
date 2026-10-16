/*
MIT License

Copyright (c) 2023 LobeHub

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/* DG 單頁多桌直接訊息下注；僅在 DG 同源頁面執行。不點擊按鈕；初始為停止。 */
"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // lib/dg-risk-inputs.ts
  function createDgRiskInputDrafts(initialMode) {
    const drafts = {
      flat: { stopLoss: "", takeProfit: "" },
      martingale: { stopLoss: "2600", takeProfit: "" },
      doubling: { stopLoss: "", takeProfit: "" }
    };
    let active = initialMode;
    return {
      initial() {
        return { ...drafts[active] };
      },
      switchTo(mode, visible) {
        drafts[active] = { ...visible };
        active = mode;
        return { ...drafts[active] };
      }
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/external.js
  var external_exports = {};
  __export(external_exports, {
    $brand: () => $brand,
    $input: () => $input,
    $output: () => $output,
    NEVER: () => NEVER,
    TimePrecision: () => TimePrecision,
    ZodAny: () => ZodAny,
    ZodArray: () => ZodArray,
    ZodBase64: () => ZodBase64,
    ZodBase64URL: () => ZodBase64URL,
    ZodBigInt: () => ZodBigInt,
    ZodBigIntFormat: () => ZodBigIntFormat,
    ZodBoolean: () => ZodBoolean,
    ZodCIDRv4: () => ZodCIDRv4,
    ZodCIDRv6: () => ZodCIDRv6,
    ZodCUID: () => ZodCUID,
    ZodCUID2: () => ZodCUID2,
    ZodCatch: () => ZodCatch,
    ZodCodec: () => ZodCodec,
    ZodCustom: () => ZodCustom,
    ZodCustomStringFormat: () => ZodCustomStringFormat,
    ZodDate: () => ZodDate,
    ZodDefault: () => ZodDefault,
    ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
    ZodE164: () => ZodE164,
    ZodEmail: () => ZodEmail,
    ZodEmoji: () => ZodEmoji,
    ZodEnum: () => ZodEnum,
    ZodError: () => ZodError,
    ZodFile: () => ZodFile,
    ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
    ZodFunction: () => ZodFunction,
    ZodGUID: () => ZodGUID,
    ZodIPv4: () => ZodIPv4,
    ZodIPv6: () => ZodIPv6,
    ZodISODate: () => ZodISODate,
    ZodISODateTime: () => ZodISODateTime,
    ZodISODuration: () => ZodISODuration,
    ZodISOTime: () => ZodISOTime,
    ZodIntersection: () => ZodIntersection,
    ZodIssueCode: () => ZodIssueCode,
    ZodJWT: () => ZodJWT,
    ZodKSUID: () => ZodKSUID,
    ZodLazy: () => ZodLazy,
    ZodLiteral: () => ZodLiteral,
    ZodMAC: () => ZodMAC,
    ZodMap: () => ZodMap,
    ZodNaN: () => ZodNaN,
    ZodNanoID: () => ZodNanoID,
    ZodNever: () => ZodNever,
    ZodNonOptional: () => ZodNonOptional,
    ZodNull: () => ZodNull,
    ZodNullable: () => ZodNullable,
    ZodNumber: () => ZodNumber,
    ZodNumberFormat: () => ZodNumberFormat,
    ZodObject: () => ZodObject,
    ZodOptional: () => ZodOptional,
    ZodPipe: () => ZodPipe,
    ZodPrefault: () => ZodPrefault,
    ZodPromise: () => ZodPromise,
    ZodReadonly: () => ZodReadonly,
    ZodRealError: () => ZodRealError,
    ZodRecord: () => ZodRecord,
    ZodSet: () => ZodSet,
    ZodString: () => ZodString,
    ZodStringFormat: () => ZodStringFormat,
    ZodSuccess: () => ZodSuccess,
    ZodSymbol: () => ZodSymbol,
    ZodTemplateLiteral: () => ZodTemplateLiteral,
    ZodTransform: () => ZodTransform,
    ZodTuple: () => ZodTuple,
    ZodType: () => ZodType,
    ZodULID: () => ZodULID,
    ZodURL: () => ZodURL,
    ZodUUID: () => ZodUUID,
    ZodUndefined: () => ZodUndefined,
    ZodUnion: () => ZodUnion,
    ZodUnknown: () => ZodUnknown,
    ZodVoid: () => ZodVoid,
    ZodXID: () => ZodXID,
    ZodXor: () => ZodXor,
    _ZodString: () => _ZodString,
    _default: () => _default2,
    _function: () => _function,
    any: () => any,
    array: () => array,
    base64: () => base642,
    base64url: () => base64url2,
    bigint: () => bigint2,
    boolean: () => boolean2,
    catch: () => _catch2,
    check: () => check,
    cidrv4: () => cidrv42,
    cidrv6: () => cidrv62,
    clone: () => clone,
    codec: () => codec,
    coerce: () => coerce_exports,
    config: () => config,
    core: () => core_exports2,
    cuid: () => cuid3,
    cuid2: () => cuid22,
    custom: () => custom,
    date: () => date3,
    decode: () => decode2,
    decodeAsync: () => decodeAsync2,
    describe: () => describe2,
    discriminatedUnion: () => discriminatedUnion,
    e164: () => e1642,
    email: () => email2,
    emoji: () => emoji2,
    encode: () => encode2,
    encodeAsync: () => encodeAsync2,
    endsWith: () => _endsWith,
    enum: () => _enum2,
    file: () => file,
    flattenError: () => flattenError,
    float32: () => float32,
    float64: () => float64,
    formatError: () => formatError,
    fromJSONSchema: () => fromJSONSchema,
    function: () => _function,
    getErrorMap: () => getErrorMap,
    globalRegistry: () => globalRegistry,
    gt: () => _gt,
    gte: () => _gte,
    guid: () => guid2,
    hash: () => hash,
    hex: () => hex2,
    hostname: () => hostname2,
    httpUrl: () => httpUrl,
    includes: () => _includes,
    instanceof: () => _instanceof,
    int: () => int,
    int32: () => int32,
    int64: () => int64,
    intersection: () => intersection,
    ipv4: () => ipv42,
    ipv6: () => ipv62,
    iso: () => iso_exports,
    json: () => json,
    jwt: () => jwt,
    keyof: () => keyof,
    ksuid: () => ksuid2,
    lazy: () => lazy,
    length: () => _length,
    literal: () => literal,
    locales: () => locales_exports,
    looseObject: () => looseObject,
    looseRecord: () => looseRecord,
    lowercase: () => _lowercase,
    lt: () => _lt,
    lte: () => _lte,
    mac: () => mac2,
    map: () => map,
    maxLength: () => _maxLength,
    maxSize: () => _maxSize,
    meta: () => meta2,
    mime: () => _mime,
    minLength: () => _minLength,
    minSize: () => _minSize,
    multipleOf: () => _multipleOf,
    nan: () => nan,
    nanoid: () => nanoid2,
    nativeEnum: () => nativeEnum,
    negative: () => _negative,
    never: () => never,
    nonnegative: () => _nonnegative,
    nonoptional: () => nonoptional,
    nonpositive: () => _nonpositive,
    normalize: () => _normalize,
    null: () => _null3,
    nullable: () => nullable,
    nullish: () => nullish2,
    number: () => number2,
    object: () => object,
    optional: () => optional,
    overwrite: () => _overwrite,
    parse: () => parse2,
    parseAsync: () => parseAsync2,
    partialRecord: () => partialRecord,
    pipe: () => pipe,
    positive: () => _positive,
    prefault: () => prefault,
    preprocess: () => preprocess,
    prettifyError: () => prettifyError,
    promise: () => promise,
    property: () => _property,
    readonly: () => readonly,
    record: () => record,
    refine: () => refine,
    regex: () => _regex,
    regexes: () => regexes_exports,
    registry: () => registry,
    safeDecode: () => safeDecode2,
    safeDecodeAsync: () => safeDecodeAsync2,
    safeEncode: () => safeEncode2,
    safeEncodeAsync: () => safeEncodeAsync2,
    safeParse: () => safeParse2,
    safeParseAsync: () => safeParseAsync2,
    set: () => set,
    setErrorMap: () => setErrorMap,
    size: () => _size,
    slugify: () => _slugify,
    startsWith: () => _startsWith,
    strictObject: () => strictObject,
    string: () => string2,
    stringFormat: () => stringFormat,
    stringbool: () => stringbool,
    success: () => success,
    superRefine: () => superRefine,
    symbol: () => symbol,
    templateLiteral: () => templateLiteral,
    toJSONSchema: () => toJSONSchema,
    toLowerCase: () => _toLowerCase,
    toUpperCase: () => _toUpperCase,
    transform: () => transform,
    treeifyError: () => treeifyError,
    trim: () => _trim,
    tuple: () => tuple,
    uint32: () => uint32,
    uint64: () => uint64,
    ulid: () => ulid2,
    undefined: () => _undefined3,
    union: () => union,
    unknown: () => unknown,
    uppercase: () => _uppercase,
    url: () => url,
    util: () => util_exports,
    uuid: () => uuid2,
    uuidv4: () => uuidv4,
    uuidv6: () => uuidv6,
    uuidv7: () => uuidv7,
    void: () => _void2,
    xid: () => xid2,
    xor: () => xor
  });

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/index.js
  var core_exports2 = {};
  __export(core_exports2, {
    $ZodAny: () => $ZodAny,
    $ZodArray: () => $ZodArray,
    $ZodAsyncError: () => $ZodAsyncError,
    $ZodBase64: () => $ZodBase64,
    $ZodBase64URL: () => $ZodBase64URL,
    $ZodBigInt: () => $ZodBigInt,
    $ZodBigIntFormat: () => $ZodBigIntFormat,
    $ZodBoolean: () => $ZodBoolean,
    $ZodCIDRv4: () => $ZodCIDRv4,
    $ZodCIDRv6: () => $ZodCIDRv6,
    $ZodCUID: () => $ZodCUID,
    $ZodCUID2: () => $ZodCUID2,
    $ZodCatch: () => $ZodCatch,
    $ZodCheck: () => $ZodCheck,
    $ZodCheckBigIntFormat: () => $ZodCheckBigIntFormat,
    $ZodCheckEndsWith: () => $ZodCheckEndsWith,
    $ZodCheckGreaterThan: () => $ZodCheckGreaterThan,
    $ZodCheckIncludes: () => $ZodCheckIncludes,
    $ZodCheckLengthEquals: () => $ZodCheckLengthEquals,
    $ZodCheckLessThan: () => $ZodCheckLessThan,
    $ZodCheckLowerCase: () => $ZodCheckLowerCase,
    $ZodCheckMaxLength: () => $ZodCheckMaxLength,
    $ZodCheckMaxSize: () => $ZodCheckMaxSize,
    $ZodCheckMimeType: () => $ZodCheckMimeType,
    $ZodCheckMinLength: () => $ZodCheckMinLength,
    $ZodCheckMinSize: () => $ZodCheckMinSize,
    $ZodCheckMultipleOf: () => $ZodCheckMultipleOf,
    $ZodCheckNumberFormat: () => $ZodCheckNumberFormat,
    $ZodCheckOverwrite: () => $ZodCheckOverwrite,
    $ZodCheckProperty: () => $ZodCheckProperty,
    $ZodCheckRegex: () => $ZodCheckRegex,
    $ZodCheckSizeEquals: () => $ZodCheckSizeEquals,
    $ZodCheckStartsWith: () => $ZodCheckStartsWith,
    $ZodCheckStringFormat: () => $ZodCheckStringFormat,
    $ZodCheckUpperCase: () => $ZodCheckUpperCase,
    $ZodCodec: () => $ZodCodec,
    $ZodCustom: () => $ZodCustom,
    $ZodCustomStringFormat: () => $ZodCustomStringFormat,
    $ZodDate: () => $ZodDate,
    $ZodDefault: () => $ZodDefault,
    $ZodDiscriminatedUnion: () => $ZodDiscriminatedUnion,
    $ZodE164: () => $ZodE164,
    $ZodEmail: () => $ZodEmail,
    $ZodEmoji: () => $ZodEmoji,
    $ZodEncodeError: () => $ZodEncodeError,
    $ZodEnum: () => $ZodEnum,
    $ZodError: () => $ZodError,
    $ZodFile: () => $ZodFile,
    $ZodFunction: () => $ZodFunction,
    $ZodGUID: () => $ZodGUID,
    $ZodIPv4: () => $ZodIPv4,
    $ZodIPv6: () => $ZodIPv6,
    $ZodISODate: () => $ZodISODate,
    $ZodISODateTime: () => $ZodISODateTime,
    $ZodISODuration: () => $ZodISODuration,
    $ZodISOTime: () => $ZodISOTime,
    $ZodIntersection: () => $ZodIntersection,
    $ZodJWT: () => $ZodJWT,
    $ZodKSUID: () => $ZodKSUID,
    $ZodLazy: () => $ZodLazy,
    $ZodLiteral: () => $ZodLiteral,
    $ZodMAC: () => $ZodMAC,
    $ZodMap: () => $ZodMap,
    $ZodNaN: () => $ZodNaN,
    $ZodNanoID: () => $ZodNanoID,
    $ZodNever: () => $ZodNever,
    $ZodNonOptional: () => $ZodNonOptional,
    $ZodNull: () => $ZodNull,
    $ZodNullable: () => $ZodNullable,
    $ZodNumber: () => $ZodNumber,
    $ZodNumberFormat: () => $ZodNumberFormat,
    $ZodObject: () => $ZodObject,
    $ZodObjectJIT: () => $ZodObjectJIT,
    $ZodOptional: () => $ZodOptional,
    $ZodPipe: () => $ZodPipe,
    $ZodPrefault: () => $ZodPrefault,
    $ZodPromise: () => $ZodPromise,
    $ZodReadonly: () => $ZodReadonly,
    $ZodRealError: () => $ZodRealError,
    $ZodRecord: () => $ZodRecord,
    $ZodRegistry: () => $ZodRegistry,
    $ZodSet: () => $ZodSet,
    $ZodString: () => $ZodString,
    $ZodStringFormat: () => $ZodStringFormat,
    $ZodSuccess: () => $ZodSuccess,
    $ZodSymbol: () => $ZodSymbol,
    $ZodTemplateLiteral: () => $ZodTemplateLiteral,
    $ZodTransform: () => $ZodTransform,
    $ZodTuple: () => $ZodTuple,
    $ZodType: () => $ZodType,
    $ZodULID: () => $ZodULID,
    $ZodURL: () => $ZodURL,
    $ZodUUID: () => $ZodUUID,
    $ZodUndefined: () => $ZodUndefined,
    $ZodUnion: () => $ZodUnion,
    $ZodUnknown: () => $ZodUnknown,
    $ZodVoid: () => $ZodVoid,
    $ZodXID: () => $ZodXID,
    $ZodXor: () => $ZodXor,
    $brand: () => $brand,
    $constructor: () => $constructor,
    $input: () => $input,
    $output: () => $output,
    Doc: () => Doc,
    JSONSchema: () => json_schema_exports,
    JSONSchemaGenerator: () => JSONSchemaGenerator,
    NEVER: () => NEVER,
    TimePrecision: () => TimePrecision,
    _any: () => _any,
    _array: () => _array,
    _base64: () => _base64,
    _base64url: () => _base64url,
    _bigint: () => _bigint,
    _boolean: () => _boolean,
    _catch: () => _catch,
    _check: () => _check,
    _cidrv4: () => _cidrv4,
    _cidrv6: () => _cidrv6,
    _coercedBigint: () => _coercedBigint,
    _coercedBoolean: () => _coercedBoolean,
    _coercedDate: () => _coercedDate,
    _coercedNumber: () => _coercedNumber,
    _coercedString: () => _coercedString,
    _cuid: () => _cuid,
    _cuid2: () => _cuid2,
    _custom: () => _custom,
    _date: () => _date,
    _decode: () => _decode,
    _decodeAsync: () => _decodeAsync,
    _default: () => _default,
    _discriminatedUnion: () => _discriminatedUnion,
    _e164: () => _e164,
    _email: () => _email,
    _emoji: () => _emoji2,
    _encode: () => _encode,
    _encodeAsync: () => _encodeAsync,
    _endsWith: () => _endsWith,
    _enum: () => _enum,
    _file: () => _file,
    _float32: () => _float32,
    _float64: () => _float64,
    _gt: () => _gt,
    _gte: () => _gte,
    _guid: () => _guid,
    _includes: () => _includes,
    _int: () => _int,
    _int32: () => _int32,
    _int64: () => _int64,
    _intersection: () => _intersection,
    _ipv4: () => _ipv4,
    _ipv6: () => _ipv6,
    _isoDate: () => _isoDate,
    _isoDateTime: () => _isoDateTime,
    _isoDuration: () => _isoDuration,
    _isoTime: () => _isoTime,
    _jwt: () => _jwt,
    _ksuid: () => _ksuid,
    _lazy: () => _lazy,
    _length: () => _length,
    _literal: () => _literal,
    _lowercase: () => _lowercase,
    _lt: () => _lt,
    _lte: () => _lte,
    _mac: () => _mac,
    _map: () => _map,
    _max: () => _lte,
    _maxLength: () => _maxLength,
    _maxSize: () => _maxSize,
    _mime: () => _mime,
    _min: () => _gte,
    _minLength: () => _minLength,
    _minSize: () => _minSize,
    _multipleOf: () => _multipleOf,
    _nan: () => _nan,
    _nanoid: () => _nanoid,
    _nativeEnum: () => _nativeEnum,
    _negative: () => _negative,
    _never: () => _never,
    _nonnegative: () => _nonnegative,
    _nonoptional: () => _nonoptional,
    _nonpositive: () => _nonpositive,
    _normalize: () => _normalize,
    _null: () => _null2,
    _nullable: () => _nullable,
    _number: () => _number,
    _optional: () => _optional,
    _overwrite: () => _overwrite,
    _parse: () => _parse,
    _parseAsync: () => _parseAsync,
    _pipe: () => _pipe,
    _positive: () => _positive,
    _promise: () => _promise,
    _property: () => _property,
    _readonly: () => _readonly,
    _record: () => _record,
    _refine: () => _refine,
    _regex: () => _regex,
    _safeDecode: () => _safeDecode,
    _safeDecodeAsync: () => _safeDecodeAsync,
    _safeEncode: () => _safeEncode,
    _safeEncodeAsync: () => _safeEncodeAsync,
    _safeParse: () => _safeParse,
    _safeParseAsync: () => _safeParseAsync,
    _set: () => _set,
    _size: () => _size,
    _slugify: () => _slugify,
    _startsWith: () => _startsWith,
    _string: () => _string,
    _stringFormat: () => _stringFormat,
    _stringbool: () => _stringbool,
    _success: () => _success,
    _superRefine: () => _superRefine,
    _symbol: () => _symbol,
    _templateLiteral: () => _templateLiteral,
    _toLowerCase: () => _toLowerCase,
    _toUpperCase: () => _toUpperCase,
    _transform: () => _transform,
    _trim: () => _trim,
    _tuple: () => _tuple,
    _uint32: () => _uint32,
    _uint64: () => _uint64,
    _ulid: () => _ulid,
    _undefined: () => _undefined2,
    _union: () => _union,
    _unknown: () => _unknown,
    _uppercase: () => _uppercase,
    _url: () => _url,
    _uuid: () => _uuid,
    _uuidv4: () => _uuidv4,
    _uuidv6: () => _uuidv6,
    _uuidv7: () => _uuidv7,
    _void: () => _void,
    _xid: () => _xid,
    _xor: () => _xor,
    clone: () => clone,
    config: () => config,
    createStandardJSONSchemaMethod: () => createStandardJSONSchemaMethod,
    createToJSONSchemaMethod: () => createToJSONSchemaMethod,
    decode: () => decode,
    decodeAsync: () => decodeAsync,
    describe: () => describe,
    encode: () => encode,
    encodeAsync: () => encodeAsync,
    extractDefs: () => extractDefs,
    finalize: () => finalize,
    flattenError: () => flattenError,
    formatError: () => formatError,
    globalConfig: () => globalConfig,
    globalRegistry: () => globalRegistry,
    initializeContext: () => initializeContext,
    isValidBase64: () => isValidBase64,
    isValidBase64URL: () => isValidBase64URL,
    isValidJWT: () => isValidJWT,
    locales: () => locales_exports,
    meta: () => meta,
    parse: () => parse,
    parseAsync: () => parseAsync,
    prettifyError: () => prettifyError,
    process: () => process,
    regexes: () => regexes_exports,
    registry: () => registry,
    safeDecode: () => safeDecode,
    safeDecodeAsync: () => safeDecodeAsync,
    safeEncode: () => safeEncode,
    safeEncodeAsync: () => safeEncodeAsync,
    safeParse: () => safeParse,
    safeParseAsync: () => safeParseAsync,
    toDotPath: () => toDotPath,
    toJSONSchema: () => toJSONSchema,
    treeifyError: () => treeifyError,
    util: () => util_exports,
    version: () => version
  });

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/core.js
  var NEVER = Object.freeze({
    status: "aborted"
  });
  // @__NO_SIDE_EFFECTS__
  function $constructor(name, initializer3, params) {
    function init(inst, def) {
      if (!inst._zod) {
        Object.defineProperty(inst, "_zod", {
          value: {
            def,
            constr: _,
            traits: /* @__PURE__ */ new Set()
          },
          enumerable: false
        });
      }
      if (inst._zod.traits.has(name)) {
        return;
      }
      inst._zod.traits.add(name);
      initializer3(inst, def);
      const proto = _.prototype;
      const keys = Object.keys(proto);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (!(k in inst)) {
          inst[k] = proto[k].bind(inst);
        }
      }
    }
    const Parent = params?.Parent ?? Object;
    class Definition extends Parent {
    }
    Object.defineProperty(Definition, "name", { value: name });
    function _(def) {
      var _a2;
      const inst = params?.Parent ? new Definition() : this;
      init(inst, def);
      (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
      for (const fn of inst._zod.deferred) {
        fn();
      }
      return inst;
    }
    Object.defineProperty(_, "init", { value: init });
    Object.defineProperty(_, Symbol.hasInstance, {
      value: (inst) => {
        if (params?.Parent && inst instanceof params.Parent)
          return true;
        return inst?._zod?.traits?.has(name);
      }
    });
    Object.defineProperty(_, "name", { value: name });
    return _;
  }
  var $brand = Symbol("zod_brand");
  var $ZodAsyncError = class extends Error {
    constructor() {
      super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
    }
  };
  var $ZodEncodeError = class extends Error {
    constructor(name) {
      super(`Encountered unidirectional transform during encode: ${name}`);
      this.name = "ZodEncodeError";
    }
  };
  var globalConfig = {};
  function config(newConfig) {
    if (newConfig)
      Object.assign(globalConfig, newConfig);
    return globalConfig;
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/util.js
  var util_exports = {};
  __export(util_exports, {
    BIGINT_FORMAT_RANGES: () => BIGINT_FORMAT_RANGES,
    Class: () => Class,
    NUMBER_FORMAT_RANGES: () => NUMBER_FORMAT_RANGES,
    aborted: () => aborted,
    allowsEval: () => allowsEval,
    assert: () => assert,
    assertEqual: () => assertEqual,
    assertIs: () => assertIs,
    assertNever: () => assertNever,
    assertNotEqual: () => assertNotEqual,
    assignProp: () => assignProp,
    base64ToUint8Array: () => base64ToUint8Array,
    base64urlToUint8Array: () => base64urlToUint8Array,
    cached: () => cached,
    captureStackTrace: () => captureStackTrace,
    cleanEnum: () => cleanEnum,
    cleanRegex: () => cleanRegex,
    clone: () => clone,
    cloneDef: () => cloneDef,
    createTransparentProxy: () => createTransparentProxy,
    defineLazy: () => defineLazy,
    esc: () => esc,
    escapeRegex: () => escapeRegex,
    extend: () => extend,
    finalizeIssue: () => finalizeIssue,
    floatSafeRemainder: () => floatSafeRemainder,
    getElementAtPath: () => getElementAtPath,
    getEnumValues: () => getEnumValues,
    getLengthableOrigin: () => getLengthableOrigin,
    getParsedType: () => getParsedType,
    getSizableOrigin: () => getSizableOrigin,
    hexToUint8Array: () => hexToUint8Array,
    isObject: () => isObject,
    isPlainObject: () => isPlainObject,
    issue: () => issue,
    joinValues: () => joinValues,
    jsonStringifyReplacer: () => jsonStringifyReplacer,
    merge: () => merge,
    mergeDefs: () => mergeDefs,
    normalizeParams: () => normalizeParams,
    nullish: () => nullish,
    numKeys: () => numKeys,
    objectClone: () => objectClone,
    omit: () => omit,
    optionalKeys: () => optionalKeys,
    partial: () => partial,
    pick: () => pick,
    prefixIssues: () => prefixIssues,
    primitiveTypes: () => primitiveTypes,
    promiseAllObject: () => promiseAllObject,
    propertyKeyTypes: () => propertyKeyTypes,
    randomString: () => randomString,
    required: () => required,
    safeExtend: () => safeExtend,
    shallowClone: () => shallowClone,
    slugify: () => slugify,
    stringifyPrimitive: () => stringifyPrimitive,
    uint8ArrayToBase64: () => uint8ArrayToBase64,
    uint8ArrayToBase64url: () => uint8ArrayToBase64url,
    uint8ArrayToHex: () => uint8ArrayToHex,
    unwrapMessage: () => unwrapMessage
  });
  function assertEqual(val) {
    return val;
  }
  function assertNotEqual(val) {
    return val;
  }
  function assertIs(_arg) {
  }
  function assertNever(_x) {
    throw new Error("Unexpected value in exhaustive check");
  }
  function assert(_) {
  }
  function getEnumValues(entries) {
    const numericValues = Object.values(entries).filter((v) => typeof v === "number");
    const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
    return values;
  }
  function joinValues(array2, separator = "|") {
    return array2.map((val) => stringifyPrimitive(val)).join(separator);
  }
  function jsonStringifyReplacer(_, value) {
    if (typeof value === "bigint")
      return value.toString();
    return value;
  }
  function cached(getter) {
    const set2 = false;
    return {
      get value() {
        if (!set2) {
          const value = getter();
          Object.defineProperty(this, "value", { value });
          return value;
        }
        throw new Error("cached value already set");
      }
    };
  }
  function nullish(input) {
    return input === null || input === void 0;
  }
  function cleanRegex(source) {
    const start = source.startsWith("^") ? 1 : 0;
    const end = source.endsWith("$") ? source.length - 1 : source.length;
    return source.slice(start, end);
  }
  function floatSafeRemainder(val, step) {
    const valDecCount = (val.toString().split(".")[1] || "").length;
    const stepString = step.toString();
    let stepDecCount = (stepString.split(".")[1] || "").length;
    if (stepDecCount === 0 && /\d?e-\d?/.test(stepString)) {
      const match = stepString.match(/\d?e-(\d?)/);
      if (match?.[1]) {
        stepDecCount = Number.parseInt(match[1]);
      }
    }
    const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
    const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
    const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
    return valInt % stepInt / 10 ** decCount;
  }
  var EVALUATING = Symbol("evaluating");
  function defineLazy(object2, key, getter) {
    let value = void 0;
    Object.defineProperty(object2, key, {
      get() {
        if (value === EVALUATING) {
          return void 0;
        }
        if (value === void 0) {
          value = EVALUATING;
          value = getter();
        }
        return value;
      },
      set(v) {
        Object.defineProperty(object2, key, {
          value: v
          // configurable: true,
        });
      },
      configurable: true
    });
  }
  function objectClone(obj) {
    return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
  }
  function assignProp(target, prop, value) {
    Object.defineProperty(target, prop, {
      value,
      writable: true,
      enumerable: true,
      configurable: true
    });
  }
  function mergeDefs(...defs) {
    const mergedDescriptors = {};
    for (const def of defs) {
      const descriptors = Object.getOwnPropertyDescriptors(def);
      Object.assign(mergedDescriptors, descriptors);
    }
    return Object.defineProperties({}, mergedDescriptors);
  }
  function cloneDef(schema) {
    return mergeDefs(schema._zod.def);
  }
  function getElementAtPath(obj, path) {
    if (!path)
      return obj;
    return path.reduce((acc, key) => acc?.[key], obj);
  }
  function promiseAllObject(promisesObj) {
    const keys = Object.keys(promisesObj);
    const promises = keys.map((key) => promisesObj[key]);
    return Promise.all(promises).then((results) => {
      const resolvedObj = {};
      for (let i = 0; i < keys.length; i++) {
        resolvedObj[keys[i]] = results[i];
      }
      return resolvedObj;
    });
  }
  function randomString(length = 10) {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let str = "";
    for (let i = 0; i < length; i++) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
  }
  function esc(str) {
    return JSON.stringify(str);
  }
  function slugify(input) {
    return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
  }
  var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {
  };
  function isObject(data) {
    return typeof data === "object" && data !== null && !Array.isArray(data);
  }
  var allowsEval = cached(() => {
    if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
      return false;
    }
    try {
      const F = Function;
      new F("");
      return true;
    } catch (_) {
      return false;
    }
  });
  function isPlainObject(o) {
    if (isObject(o) === false)
      return false;
    const ctor = o.constructor;
    if (ctor === void 0)
      return true;
    if (typeof ctor !== "function")
      return true;
    const prot = ctor.prototype;
    if (isObject(prot) === false)
      return false;
    if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
      return false;
    }
    return true;
  }
  function shallowClone(o) {
    if (isPlainObject(o))
      return { ...o };
    if (Array.isArray(o))
      return [...o];
    return o;
  }
  function numKeys(data) {
    let keyCount = 0;
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        keyCount++;
      }
    }
    return keyCount;
  }
  var getParsedType = (data) => {
    const t = typeof data;
    switch (t) {
      case "undefined":
        return "undefined";
      case "string":
        return "string";
      case "number":
        return Number.isNaN(data) ? "nan" : "number";
      case "boolean":
        return "boolean";
      case "function":
        return "function";
      case "bigint":
        return "bigint";
      case "symbol":
        return "symbol";
      case "object":
        if (Array.isArray(data)) {
          return "array";
        }
        if (data === null) {
          return "null";
        }
        if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
          return "promise";
        }
        if (typeof Map !== "undefined" && data instanceof Map) {
          return "map";
        }
        if (typeof Set !== "undefined" && data instanceof Set) {
          return "set";
        }
        if (typeof Date !== "undefined" && data instanceof Date) {
          return "date";
        }
        if (typeof File !== "undefined" && data instanceof File) {
          return "file";
        }
        return "object";
      default:
        throw new Error(`Unknown data type: ${t}`);
    }
  };
  var propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
  var primitiveTypes = /* @__PURE__ */ new Set(["string", "number", "bigint", "boolean", "symbol", "undefined"]);
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function clone(inst, def, params) {
    const cl = new inst._zod.constr(def ?? inst._zod.def);
    if (!def || params?.parent)
      cl._zod.parent = inst;
    return cl;
  }
  function normalizeParams(_params) {
    const params = _params;
    if (!params)
      return {};
    if (typeof params === "string")
      return { error: () => params };
    if (params?.message !== void 0) {
      if (params?.error !== void 0)
        throw new Error("Cannot specify both `message` and `error` params");
      params.error = params.message;
    }
    delete params.message;
    if (typeof params.error === "string")
      return { ...params, error: () => params.error };
    return params;
  }
  function createTransparentProxy(getter) {
    let target;
    return new Proxy({}, {
      get(_, prop, receiver) {
        target ?? (target = getter());
        return Reflect.get(target, prop, receiver);
      },
      set(_, prop, value, receiver) {
        target ?? (target = getter());
        return Reflect.set(target, prop, value, receiver);
      },
      has(_, prop) {
        target ?? (target = getter());
        return Reflect.has(target, prop);
      },
      deleteProperty(_, prop) {
        target ?? (target = getter());
        return Reflect.deleteProperty(target, prop);
      },
      ownKeys(_) {
        target ?? (target = getter());
        return Reflect.ownKeys(target);
      },
      getOwnPropertyDescriptor(_, prop) {
        target ?? (target = getter());
        return Reflect.getOwnPropertyDescriptor(target, prop);
      },
      defineProperty(_, prop, descriptor) {
        target ?? (target = getter());
        return Reflect.defineProperty(target, prop, descriptor);
      }
    });
  }
  function stringifyPrimitive(value) {
    if (typeof value === "bigint")
      return value.toString() + "n";
    if (typeof value === "string")
      return `"${value}"`;
    return `${value}`;
  }
  function optionalKeys(shape) {
    return Object.keys(shape).filter((k) => {
      return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
    });
  }
  var NUMBER_FORMAT_RANGES = {
    safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    int32: [-2147483648, 2147483647],
    uint32: [0, 4294967295],
    float32: [-34028234663852886e22, 34028234663852886e22],
    float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
  };
  var BIGINT_FORMAT_RANGES = {
    int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
    uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
  };
  function pick(schema, mask) {
    const currDef = schema._zod.def;
    const def = mergeDefs(schema._zod.def, {
      get shape() {
        const newShape = {};
        for (const key in mask) {
          if (!(key in currDef.shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          newShape[key] = currDef.shape[key];
        }
        assignProp(this, "shape", newShape);
        return newShape;
      },
      checks: []
    });
    return clone(schema, def);
  }
  function omit(schema, mask) {
    const currDef = schema._zod.def;
    const def = mergeDefs(schema._zod.def, {
      get shape() {
        const newShape = { ...schema._zod.def.shape };
        for (const key in mask) {
          if (!(key in currDef.shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          delete newShape[key];
        }
        assignProp(this, "shape", newShape);
        return newShape;
      },
      checks: []
    });
    return clone(schema, def);
  }
  function extend(schema, shape) {
    if (!isPlainObject(shape)) {
      throw new Error("Invalid input to extend: expected a plain object");
    }
    const checks = schema._zod.def.checks;
    const hasChecks = checks && checks.length > 0;
    if (hasChecks) {
      throw new Error("Object schemas containing refinements cannot be extended. Use `.safeExtend()` instead.");
    }
    const def = mergeDefs(schema._zod.def, {
      get shape() {
        const _shape = { ...schema._zod.def.shape, ...shape };
        assignProp(this, "shape", _shape);
        return _shape;
      },
      checks: []
    });
    return clone(schema, def);
  }
  function safeExtend(schema, shape) {
    if (!isPlainObject(shape)) {
      throw new Error("Invalid input to safeExtend: expected a plain object");
    }
    const def = {
      ...schema._zod.def,
      get shape() {
        const _shape = { ...schema._zod.def.shape, ...shape };
        assignProp(this, "shape", _shape);
        return _shape;
      },
      checks: schema._zod.def.checks
    };
    return clone(schema, def);
  }
  function merge(a, b) {
    const def = mergeDefs(a._zod.def, {
      get shape() {
        const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
        assignProp(this, "shape", _shape);
        return _shape;
      },
      get catchall() {
        return b._zod.def.catchall;
      },
      checks: []
      // delete existing checks
    });
    return clone(a, def);
  }
  function partial(Class2, schema, mask) {
    const def = mergeDefs(schema._zod.def, {
      get shape() {
        const oldShape = schema._zod.def.shape;
        const shape = { ...oldShape };
        if (mask) {
          for (const key in mask) {
            if (!(key in oldShape)) {
              throw new Error(`Unrecognized key: "${key}"`);
            }
            if (!mask[key])
              continue;
            shape[key] = Class2 ? new Class2({
              type: "optional",
              innerType: oldShape[key]
            }) : oldShape[key];
          }
        } else {
          for (const key in oldShape) {
            shape[key] = Class2 ? new Class2({
              type: "optional",
              innerType: oldShape[key]
            }) : oldShape[key];
          }
        }
        assignProp(this, "shape", shape);
        return shape;
      },
      checks: []
    });
    return clone(schema, def);
  }
  function required(Class2, schema, mask) {
    const def = mergeDefs(schema._zod.def, {
      get shape() {
        const oldShape = schema._zod.def.shape;
        const shape = { ...oldShape };
        if (mask) {
          for (const key in mask) {
            if (!(key in shape)) {
              throw new Error(`Unrecognized key: "${key}"`);
            }
            if (!mask[key])
              continue;
            shape[key] = new Class2({
              type: "nonoptional",
              innerType: oldShape[key]
            });
          }
        } else {
          for (const key in oldShape) {
            shape[key] = new Class2({
              type: "nonoptional",
              innerType: oldShape[key]
            });
          }
        }
        assignProp(this, "shape", shape);
        return shape;
      },
      checks: []
    });
    return clone(schema, def);
  }
  function aborted(x, startIndex = 0) {
    if (x.aborted === true)
      return true;
    for (let i = startIndex; i < x.issues.length; i++) {
      if (x.issues[i]?.continue !== true) {
        return true;
      }
    }
    return false;
  }
  function prefixIssues(path, issues) {
    return issues.map((iss) => {
      var _a2;
      (_a2 = iss).path ?? (_a2.path = []);
      iss.path.unshift(path);
      return iss;
    });
  }
  function unwrapMessage(message) {
    return typeof message === "string" ? message : message?.message;
  }
  function finalizeIssue(iss, ctx, config2) {
    const full = { ...iss, path: iss.path ?? [] };
    if (!iss.message) {
      const message = unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config2.customError?.(iss)) ?? unwrapMessage(config2.localeError?.(iss)) ?? "Invalid input";
      full.message = message;
    }
    delete full.inst;
    delete full.continue;
    if (!ctx?.reportInput) {
      delete full.input;
    }
    return full;
  }
  function getSizableOrigin(input) {
    if (input instanceof Set)
      return "set";
    if (input instanceof Map)
      return "map";
    if (input instanceof File)
      return "file";
    return "unknown";
  }
  function getLengthableOrigin(input) {
    if (Array.isArray(input))
      return "array";
    if (typeof input === "string")
      return "string";
    return "unknown";
  }
  function issue(...args) {
    const [iss, input, inst] = args;
    if (typeof iss === "string") {
      return {
        message: iss,
        code: "custom",
        input,
        inst
      };
    }
    return { ...iss };
  }
  function cleanEnum(obj) {
    return Object.entries(obj).filter(([k, _]) => {
      return Number.isNaN(Number.parseInt(k, 10));
    }).map((el) => el[1]);
  }
  function base64ToUint8Array(base643) {
    const binaryString = atob(base643);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  function uint8ArrayToBase64(bytes) {
    let binaryString = "";
    for (let i = 0; i < bytes.length; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    return btoa(binaryString);
  }
  function base64urlToUint8Array(base64url3) {
    const base643 = base64url3.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - base643.length % 4) % 4);
    return base64ToUint8Array(base643 + padding);
  }
  function uint8ArrayToBase64url(bytes) {
    return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
  function hexToUint8Array(hex3) {
    const cleanHex = hex3.replace(/^0x/, "");
    if (cleanHex.length % 2 !== 0) {
      throw new Error("Invalid hex string length");
    }
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
    }
    return bytes;
  }
  function uint8ArrayToHex(bytes) {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  var Class = class {
    constructor(..._args) {
    }
  };

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/errors.js
  var initializer = (inst, def) => {
    inst.name = "$ZodError";
    Object.defineProperty(inst, "_zod", {
      value: inst._zod,
      enumerable: false
    });
    Object.defineProperty(inst, "issues", {
      value: def,
      enumerable: false
    });
    inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
    Object.defineProperty(inst, "toString", {
      value: () => inst.message,
      enumerable: false
    });
  };
  var $ZodError = $constructor("$ZodError", initializer);
  var $ZodRealError = $constructor("$ZodError", initializer, { Parent: Error });
  function flattenError(error46, mapper = (issue2) => issue2.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of error46.issues) {
      if (sub.path.length > 0) {
        fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
        fieldErrors[sub.path[0]].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  function formatError(error46, mapper = (issue2) => issue2.message) {
    const fieldErrors = { _errors: [] };
    const processError = (error47) => {
      for (const issue2 of error47.issues) {
        if (issue2.code === "invalid_union" && issue2.errors.length) {
          issue2.errors.map((issues) => processError({ issues }));
        } else if (issue2.code === "invalid_key") {
          processError({ issues: issue2.issues });
        } else if (issue2.code === "invalid_element") {
          processError({ issues: issue2.issues });
        } else if (issue2.path.length === 0) {
          fieldErrors._errors.push(mapper(issue2));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue2.path.length) {
            const el = issue2.path[i];
            const terminal = i === issue2.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue2));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(error46);
    return fieldErrors;
  }
  function treeifyError(error46, mapper = (issue2) => issue2.message) {
    const result = { errors: [] };
    const processError = (error47, path = []) => {
      var _a2, _b;
      for (const issue2 of error47.issues) {
        if (issue2.code === "invalid_union" && issue2.errors.length) {
          issue2.errors.map((issues) => processError({ issues }, issue2.path));
        } else if (issue2.code === "invalid_key") {
          processError({ issues: issue2.issues }, issue2.path);
        } else if (issue2.code === "invalid_element") {
          processError({ issues: issue2.issues }, issue2.path);
        } else {
          const fullpath = [...path, ...issue2.path];
          if (fullpath.length === 0) {
            result.errors.push(mapper(issue2));
            continue;
          }
          let curr = result;
          let i = 0;
          while (i < fullpath.length) {
            const el = fullpath[i];
            const terminal = i === fullpath.length - 1;
            if (typeof el === "string") {
              curr.properties ?? (curr.properties = {});
              (_a2 = curr.properties)[el] ?? (_a2[el] = { errors: [] });
              curr = curr.properties[el];
            } else {
              curr.items ?? (curr.items = []);
              (_b = curr.items)[el] ?? (_b[el] = { errors: [] });
              curr = curr.items[el];
            }
            if (terminal) {
              curr.errors.push(mapper(issue2));
            }
            i++;
          }
        }
      }
    };
    processError(error46);
    return result;
  }
  function toDotPath(_path) {
    const segs = [];
    const path = _path.map((seg) => typeof seg === "object" ? seg.key : seg);
    for (const seg of path) {
      if (typeof seg === "number")
        segs.push(`[${seg}]`);
      else if (typeof seg === "symbol")
        segs.push(`[${JSON.stringify(String(seg))}]`);
      else if (/[^\w$]/.test(seg))
        segs.push(`[${JSON.stringify(seg)}]`);
      else {
        if (segs.length)
          segs.push(".");
        segs.push(seg);
      }
    }
    return segs.join("");
  }
  function prettifyError(error46) {
    const lines = [];
    const issues = [...error46.issues].sort((a, b) => (a.path ?? []).length - (b.path ?? []).length);
    for (const issue2 of issues) {
      lines.push(`\u2716 ${issue2.message}`);
      if (issue2.path?.length)
        lines.push(`  \u2192 at ${toDotPath(issue2.path)}`);
    }
    return lines.join("\n");
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/parse.js
  var _parse = (_Err) => (schema, value, _ctx, _params) => {
    const ctx = _ctx ? Object.assign(_ctx, { async: false }) : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
      throw new $ZodAsyncError();
    }
    if (result.issues.length) {
      const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
      captureStackTrace(e, _params?.callee);
      throw e;
    }
    return result.value;
  };
  var parse = /* @__PURE__ */ _parse($ZodRealError);
  var _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
    const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise)
      result = await result;
    if (result.issues.length) {
      const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
      captureStackTrace(e, params?.callee);
      throw e;
    }
    return result.value;
  };
  var parseAsync = /* @__PURE__ */ _parseAsync($ZodRealError);
  var _safeParse = (_Err) => (schema, value, _ctx) => {
    const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
      throw new $ZodAsyncError();
    }
    return result.issues.length ? {
      success: false,
      error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
    } : { success: true, data: result.value };
  };
  var safeParse = /* @__PURE__ */ _safeParse($ZodRealError);
  var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
    const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise)
      result = await result;
    return result.issues.length ? {
      success: false,
      error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
    } : { success: true, data: result.value };
  };
  var safeParseAsync = /* @__PURE__ */ _safeParseAsync($ZodRealError);
  var _encode = (_Err) => (schema, value, _ctx) => {
    const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
    return _parse(_Err)(schema, value, ctx);
  };
  var encode = /* @__PURE__ */ _encode($ZodRealError);
  var _decode = (_Err) => (schema, value, _ctx) => {
    return _parse(_Err)(schema, value, _ctx);
  };
  var decode = /* @__PURE__ */ _decode($ZodRealError);
  var _encodeAsync = (_Err) => async (schema, value, _ctx) => {
    const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
    return _parseAsync(_Err)(schema, value, ctx);
  };
  var encodeAsync = /* @__PURE__ */ _encodeAsync($ZodRealError);
  var _decodeAsync = (_Err) => async (schema, value, _ctx) => {
    return _parseAsync(_Err)(schema, value, _ctx);
  };
  var decodeAsync = /* @__PURE__ */ _decodeAsync($ZodRealError);
  var _safeEncode = (_Err) => (schema, value, _ctx) => {
    const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
    return _safeParse(_Err)(schema, value, ctx);
  };
  var safeEncode = /* @__PURE__ */ _safeEncode($ZodRealError);
  var _safeDecode = (_Err) => (schema, value, _ctx) => {
    return _safeParse(_Err)(schema, value, _ctx);
  };
  var safeDecode = /* @__PURE__ */ _safeDecode($ZodRealError);
  var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
    const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
    return _safeParseAsync(_Err)(schema, value, ctx);
  };
  var safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync($ZodRealError);
  var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
    return _safeParseAsync(_Err)(schema, value, _ctx);
  };
  var safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync($ZodRealError);

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/regexes.js
  var regexes_exports = {};
  __export(regexes_exports, {
    base64: () => base64,
    base64url: () => base64url,
    bigint: () => bigint,
    boolean: () => boolean,
    browserEmail: () => browserEmail,
    cidrv4: () => cidrv4,
    cidrv6: () => cidrv6,
    cuid: () => cuid,
    cuid2: () => cuid2,
    date: () => date,
    datetime: () => datetime,
    domain: () => domain,
    duration: () => duration,
    e164: () => e164,
    email: () => email,
    emoji: () => emoji,
    extendedDuration: () => extendedDuration,
    guid: () => guid,
    hex: () => hex,
    hostname: () => hostname,
    html5Email: () => html5Email,
    idnEmail: () => idnEmail,
    integer: () => integer,
    ipv4: () => ipv4,
    ipv6: () => ipv6,
    ksuid: () => ksuid,
    lowercase: () => lowercase,
    mac: () => mac,
    md5_base64: () => md5_base64,
    md5_base64url: () => md5_base64url,
    md5_hex: () => md5_hex,
    nanoid: () => nanoid,
    null: () => _null,
    number: () => number,
    rfc5322Email: () => rfc5322Email,
    sha1_base64: () => sha1_base64,
    sha1_base64url: () => sha1_base64url,
    sha1_hex: () => sha1_hex,
    sha256_base64: () => sha256_base64,
    sha256_base64url: () => sha256_base64url,
    sha256_hex: () => sha256_hex,
    sha384_base64: () => sha384_base64,
    sha384_base64url: () => sha384_base64url,
    sha384_hex: () => sha384_hex,
    sha512_base64: () => sha512_base64,
    sha512_base64url: () => sha512_base64url,
    sha512_hex: () => sha512_hex,
    string: () => string,
    time: () => time,
    ulid: () => ulid,
    undefined: () => _undefined,
    unicodeEmail: () => unicodeEmail,
    uppercase: () => uppercase,
    uuid: () => uuid,
    uuid4: () => uuid4,
    uuid6: () => uuid6,
    uuid7: () => uuid7,
    xid: () => xid
  });
  var cuid = /^[cC][^\s-]{8,}$/;
  var cuid2 = /^[0-9a-z]+$/;
  var ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
  var xid = /^[0-9a-vA-V]{20}$/;
  var ksuid = /^[A-Za-z0-9]{27}$/;
  var nanoid = /^[a-zA-Z0-9_-]{21}$/;
  var duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
  var extendedDuration = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
  var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
  var uuid = (version2) => {
    if (!version2)
      return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
    return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version2}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
  };
  var uuid4 = /* @__PURE__ */ uuid(4);
  var uuid6 = /* @__PURE__ */ uuid(6);
  var uuid7 = /* @__PURE__ */ uuid(7);
  var email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
  var html5Email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  var rfc5322Email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var unicodeEmail = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u;
  var idnEmail = unicodeEmail;
  var browserEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  var _emoji = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
  function emoji() {
    return new RegExp(_emoji, "u");
  }
  var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
  var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
  var mac = (delimiter) => {
    const escapedDelim = escapeRegex(delimiter ?? ":");
    return new RegExp(`^(?:[0-9A-F]{2}${escapedDelim}){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}${escapedDelim}){5}[0-9a-f]{2}$`);
  };
  var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
  var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
  var base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
  var base64url = /^[A-Za-z0-9_-]*$/;
  var hostname = /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/;
  var domain = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  var e164 = /^\+(?:[0-9]){6,14}[0-9]$/;
  var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
  var date = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
  function timeSource(args) {
    const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
    const regex = typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
    return regex;
  }
  function time(args) {
    return new RegExp(`^${timeSource(args)}$`);
  }
  function datetime(args) {
    const time3 = timeSource({ precision: args.precision });
    const opts = ["Z"];
    if (args.local)
      opts.push("");
    if (args.offset)
      opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
    const timeRegex = `${time3}(?:${opts.join("|")})`;
    return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
  }
  var string = (params) => {
    const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
    return new RegExp(`^${regex}$`);
  };
  var bigint = /^-?\d+n?$/;
  var integer = /^-?\d+$/;
  var number = /^-?\d+(?:\.\d+)?/;
  var boolean = /^(?:true|false)$/i;
  var _null = /^null$/i;
  var _undefined = /^undefined$/i;
  var lowercase = /^[^A-Z]*$/;
  var uppercase = /^[^a-z]*$/;
  var hex = /^[0-9a-fA-F]*$/;
  function fixedBase64(bodyLength, padding) {
    return new RegExp(`^[A-Za-z0-9+/]{${bodyLength}}${padding}$`);
  }
  function fixedBase64url(length) {
    return new RegExp(`^[A-Za-z0-9_-]{${length}}$`);
  }
  var md5_hex = /^[0-9a-fA-F]{32}$/;
  var md5_base64 = /* @__PURE__ */ fixedBase64(22, "==");
  var md5_base64url = /* @__PURE__ */ fixedBase64url(22);
  var sha1_hex = /^[0-9a-fA-F]{40}$/;
  var sha1_base64 = /* @__PURE__ */ fixedBase64(27, "=");
  var sha1_base64url = /* @__PURE__ */ fixedBase64url(27);
  var sha256_hex = /^[0-9a-fA-F]{64}$/;
  var sha256_base64 = /* @__PURE__ */ fixedBase64(43, "=");
  var sha256_base64url = /* @__PURE__ */ fixedBase64url(43);
  var sha384_hex = /^[0-9a-fA-F]{96}$/;
  var sha384_base64 = /* @__PURE__ */ fixedBase64(64, "");
  var sha384_base64url = /* @__PURE__ */ fixedBase64url(64);
  var sha512_hex = /^[0-9a-fA-F]{128}$/;
  var sha512_base64 = /* @__PURE__ */ fixedBase64(86, "==");
  var sha512_base64url = /* @__PURE__ */ fixedBase64url(86);

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/checks.js
  var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
    var _a2;
    inst._zod ?? (inst._zod = {});
    inst._zod.def = def;
    (_a2 = inst._zod).onattach ?? (_a2.onattach = []);
  });
  var numericOriginMap = {
    number: "number",
    bigint: "bigint",
    object: "date"
  };
  var $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
    $ZodCheck.init(inst, def);
    const origin = numericOriginMap[typeof def.value];
    inst._zod.onattach.push((inst2) => {
      const bag = inst2._zod.bag;
      const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
      if (def.value < curr) {
        if (def.inclusive)
          bag.maximum = def.value;
        else
          bag.exclusiveMaximum = def.value;
      }
    });
    inst._zod.check = (payload) => {
      if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
        return;
      }
      payload.issues.push({
        origin,
        code: "too_big",
        maximum: def.value,
        input: payload.value,
        inclusive: def.inclusive,
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
    $ZodCheck.init(inst, def);
    const origin = numericOriginMap[typeof def.value];
    inst._zod.onattach.push((inst2) => {
      const bag = inst2._zod.bag;
      const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
      if (def.value > curr) {
        if (def.inclusive)
          bag.minimum = def.value;
        else
          bag.exclusiveMinimum = def.value;
      }
    });
    inst._zod.check = (payload) => {
      if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
        return;
      }
      payload.issues.push({
        origin,
        code: "too_small",
        minimum: def.value,
        input: payload.value,
        inclusive: def.inclusive,
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
    $ZodCheck.init(inst, def);
    inst._zod.onattach.push((inst2) => {
      var _a2;
      (_a2 = inst2._zod.bag).multipleOf ?? (_a2.multipleOf = def.value);
    });
    inst._zod.check = (payload) => {
      if (typeof payload.value !== typeof def.value)
        throw new Error("Cannot mix number and bigint in multiple_of check.");
      const isMultiple = typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0;
      if (isMultiple)
        return;
      payload.issues.push({
        origin: typeof payload.value,
        code: "not_multiple_of",
        divisor: def.value,
        input: payload.value,
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
    $ZodCheck.init(inst, def);
    def.format = def.format || "float64";
    const isInt = def.format?.includes("int");
    const origin = isInt ? "int" : "number";
    const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
    inst._zod.onattach.push((inst2) => {
      const bag = inst2._zod.bag;
      bag.format = def.format;
      bag.minimum = minimum;
      bag.maximum = maximum;
      if (isInt)
        bag.pattern = integer;
    });
    inst._zod.check = (payload) => {
      const input = payload.value;
      if (isInt) {
        if (!Number.isInteger(input)) {
          payload.issues.push({
            expected: origin,
            format: def.format,
            code: "invalid_type",
            continue: false,
            input,
            inst
          });
          return;
        }
        if (!Number.isSafeInteger(input)) {
          if (input > 0) {
            payload.issues.push({
              input,
              code: "too_big",
              maximum: Number.MAX_SAFE_INTEGER,
              note: "Integers must be within the safe integer range.",
              inst,
              origin,
              continue: !def.abort
            });
          } else {
            payload.issues.push({
              input,
              code: "too_small",
              minimum: Number.MIN_SAFE_INTEGER,
              note: "Integers must be within the safe integer range.",
              inst,
              origin,
              continue: !def.abort
            });
          }
          return;
        }
      }
      if (input < minimum) {
        payload.issues.push({
          origin: "number",
          input,
          code: "too_small",
          minimum,
          inclusive: true,
          inst,
          continue: !def.abort
        });
      }
      if (input > maximum) {
        payload.issues.push({
          origin: "number",
          input,
          code: "too_big",
          maximum,
          inst
        });
      }
    };
  });
  var $ZodCheckBigIntFormat = /* @__PURE__ */ $constructor("$ZodCheckBigIntFormat", (inst, def) => {
    $ZodCheck.init(inst, def);
    const [minimum, maximum] = BIGINT_FORMAT_RANGES[def.format];
    inst._zod.onattach.push((inst2) => {
      const bag = inst2._zod.bag;
      bag.format = def.format;
      bag.minimum = minimum;
      bag.maximum = maximum;
    });
    inst._zod.check = (payload) => {
      const input = payload.value;
      if (input < minimum) {
        payload.issues.push({
          origin: "bigint",
          input,
          code: "too_small",
          minimum,
          inclusive: true,
          inst,
          continue: !def.abort
        });
      }
      if (input > maximum) {
        payload.issues.push({
          origin: "bigint",
          input,
          code: "too_big",
          maximum,
          inst
        });
      }
    };
  });
  var $ZodCheckMaxSize = /* @__PURE__ */ $constructor("$ZodCheckMaxSize", (inst, def) => {
    var _a2;
    $ZodCheck.init(inst, def);
    (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
      const val = payload.value;
      return !nullish(val) && val.size !== void 0;
    });
    inst._zod.onattach.push((inst2) => {
      const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
      if (def.maximum < curr)
        inst2._zod.bag.maximum = def.maximum;
    });
    inst._zod.check = (payload) => {
      const input = payload.value;
      const size = input.size;
      if (size <= def.maximum)
        return;
      payload.issues.push({
        origin: getSizableOrigin(input),
        code: "too_big",
        maximum: def.maximum,
        inclusive: true,
        input,
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodCheckMinSize = /* @__PURE__ */ $constructor("$ZodCheckMinSize", (inst, def) => {
    var _a2;
    $ZodCheck.init(inst, def);
    (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
      const val = payload.value;
      return !nullish(val) && val.size !== void 0;
    });
    inst._zod.onattach.push((inst2) => {
      const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
      if (def.minimum > curr)
        inst2._zod.bag.minimum = def.minimum;
    });
    inst._zod.check = (payload) => {
      const input = payload.value;
      const size = input.size;
      if (size >= def.minimum)
        return;
      payload.issues.push({
        origin: getSizableOrigin(input),
        code: "too_small",
        minimum: def.minimum,
        inclusive: true,
        input,
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodCheckSizeEquals = /* @__PURE__ */ $constructor("$ZodCheckSizeEquals", (inst, def) => {
    var _a2;
    $ZodCheck.init(inst, def);
    (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
      const val = payload.value;
      return !nullish(val) && val.size !== void 0;
    });
    inst._zod.onattach.push((inst2) => {
      const bag = inst2._zod.bag;
      bag.minimum = def.size;
      bag.maximum = def.size;
      bag.size = def.size;
    });
    inst._zod.check = (payload) => {
      const input = payload.value;
      const size = input.size;
      if (size === def.size)
        return;
      const tooBig = size > def.size;
      payload.issues.push({
        origin: getSizableOrigin(input),
        ...tooBig ? { code: "too_big", maximum: def.size } : { code: "too_small", minimum: def.size },
        inclusive: true,
        exact: true,
        input: payload.value,
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
    var _a2;
    $ZodCheck.init(inst, def);
    (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
      const val = payload.value;
      return !nullish(val) && val.length !== void 0;
    });
    inst._zod.onattach.push((inst2) => {
      const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
      if (def.maximum < curr)
        inst2._zod.bag.maximum = def.maximum;
    });
    inst._zod.check = (payload) => {
      const input = payload.value;
      const length = input.length;
      if (length <= def.maximum)
        return;
      const origin = getLengthableOrigin(input);
      payload.issues.push({
        origin,
        code: "too_big",
        maximum: def.maximum,
        inclusive: true,
        input,
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
    var _a2;
    $ZodCheck.init(inst, def);
    (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
      const val = payload.value;
      return !nullish(val) && val.length !== void 0;
    });
    inst._zod.onattach.push((inst2) => {
      const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
      if (def.minimum > curr)
        inst2._zod.bag.minimum = def.minimum;
    });
    inst._zod.check = (payload) => {
      const input = payload.value;
      const length = input.length;
      if (length >= def.minimum)
        return;
      const origin = getLengthableOrigin(input);
      payload.issues.push({
        origin,
        code: "too_small",
        minimum: def.minimum,
        inclusive: true,
        input,
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
    var _a2;
    $ZodCheck.init(inst, def);
    (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
      const val = payload.value;
      return !nullish(val) && val.length !== void 0;
    });
    inst._zod.onattach.push((inst2) => {
      const bag = inst2._zod.bag;
      bag.minimum = def.length;
      bag.maximum = def.length;
      bag.length = def.length;
    });
    inst._zod.check = (payload) => {
      const input = payload.value;
      const length = input.length;
      if (length === def.length)
        return;
      const origin = getLengthableOrigin(input);
      const tooBig = length > def.length;
      payload.issues.push({
        origin,
        ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
        inclusive: true,
        exact: true,
        input: payload.value,
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
    var _a2, _b;
    $ZodCheck.init(inst, def);
    inst._zod.onattach.push((inst2) => {
      const bag = inst2._zod.bag;
      bag.format = def.format;
      if (def.pattern) {
        bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
        bag.patterns.add(def.pattern);
      }
    });
    if (def.pattern)
      (_a2 = inst._zod).check ?? (_a2.check = (payload) => {
        def.pattern.lastIndex = 0;
        if (def.pattern.test(payload.value))
          return;
        payload.issues.push({
          origin: "string",
          code: "invalid_format",
          format: def.format,
          input: payload.value,
          ...def.pattern ? { pattern: def.pattern.toString() } : {},
          inst,
          continue: !def.abort
        });
      });
    else
      (_b = inst._zod).check ?? (_b.check = () => {
      });
  });
  var $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
    $ZodCheckStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
      def.pattern.lastIndex = 0;
      if (def.pattern.test(payload.value))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: "regex",
        input: payload.value,
        pattern: def.pattern.toString(),
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
    def.pattern ?? (def.pattern = lowercase);
    $ZodCheckStringFormat.init(inst, def);
  });
  var $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
    def.pattern ?? (def.pattern = uppercase);
    $ZodCheckStringFormat.init(inst, def);
  });
  var $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
    $ZodCheck.init(inst, def);
    const escapedRegex = escapeRegex(def.includes);
    const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
    def.pattern = pattern;
    inst._zod.onattach.push((inst2) => {
      const bag = inst2._zod.bag;
      bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
      bag.patterns.add(pattern);
    });
    inst._zod.check = (payload) => {
      if (payload.value.includes(def.includes, def.position))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: "includes",
        includes: def.includes,
        input: payload.value,
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
    $ZodCheck.init(inst, def);
    const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
    def.pattern ?? (def.pattern = pattern);
    inst._zod.onattach.push((inst2) => {
      const bag = inst2._zod.bag;
      bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
      bag.patterns.add(pattern);
    });
    inst._zod.check = (payload) => {
      if (payload.value.startsWith(def.prefix))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: "starts_with",
        prefix: def.prefix,
        input: payload.value,
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
    $ZodCheck.init(inst, def);
    const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
    def.pattern ?? (def.pattern = pattern);
    inst._zod.onattach.push((inst2) => {
      const bag = inst2._zod.bag;
      bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
      bag.patterns.add(pattern);
    });
    inst._zod.check = (payload) => {
      if (payload.value.endsWith(def.suffix))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: "ends_with",
        suffix: def.suffix,
        input: payload.value,
        inst,
        continue: !def.abort
      });
    };
  });
  function handleCheckPropertyResult(result, payload, property) {
    if (result.issues.length) {
      payload.issues.push(...prefixIssues(property, result.issues));
    }
  }
  var $ZodCheckProperty = /* @__PURE__ */ $constructor("$ZodCheckProperty", (inst, def) => {
    $ZodCheck.init(inst, def);
    inst._zod.check = (payload) => {
      const result = def.schema._zod.run({
        value: payload.value[def.property],
        issues: []
      }, {});
      if (result instanceof Promise) {
        return result.then((result2) => handleCheckPropertyResult(result2, payload, def.property));
      }
      handleCheckPropertyResult(result, payload, def.property);
      return;
    };
  });
  var $ZodCheckMimeType = /* @__PURE__ */ $constructor("$ZodCheckMimeType", (inst, def) => {
    $ZodCheck.init(inst, def);
    const mimeSet = new Set(def.mime);
    inst._zod.onattach.push((inst2) => {
      inst2._zod.bag.mime = def.mime;
    });
    inst._zod.check = (payload) => {
      if (mimeSet.has(payload.value.type))
        return;
      payload.issues.push({
        code: "invalid_value",
        values: def.mime,
        input: payload.value.type,
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
    $ZodCheck.init(inst, def);
    inst._zod.check = (payload) => {
      payload.value = def.tx(payload.value);
    };
  });

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/doc.js
  var Doc = class {
    constructor(args = []) {
      this.content = [];
      this.indent = 0;
      if (this)
        this.args = args;
    }
    indented(fn) {
      this.indent += 1;
      fn(this);
      this.indent -= 1;
    }
    write(arg) {
      if (typeof arg === "function") {
        arg(this, { execution: "sync" });
        arg(this, { execution: "async" });
        return;
      }
      const content = arg;
      const lines = content.split("\n").filter((x) => x);
      const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
      const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
      for (const line of dedented) {
        this.content.push(line);
      }
    }
    compile() {
      const F = Function;
      const args = this?.args;
      const content = this?.content ?? [``];
      const lines = [...content.map((x) => `  ${x}`)];
      return new F(...args, lines.join("\n"));
    }
  };

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/versions.js
  var version = {
    major: 4,
    minor: 2,
    patch: 1
  };

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/schemas.js
  var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
    var _a2;
    inst ?? (inst = {});
    inst._zod.def = def;
    inst._zod.bag = inst._zod.bag || {};
    inst._zod.version = version;
    const checks = [...inst._zod.def.checks ?? []];
    if (inst._zod.traits.has("$ZodCheck")) {
      checks.unshift(inst);
    }
    for (const ch of checks) {
      for (const fn of ch._zod.onattach) {
        fn(inst);
      }
    }
    if (checks.length === 0) {
      (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
      inst._zod.deferred?.push(() => {
        inst._zod.run = inst._zod.parse;
      });
    } else {
      const runChecks = (payload, checks2, ctx) => {
        let isAborted = aborted(payload);
        let asyncResult;
        for (const ch of checks2) {
          if (ch._zod.def.when) {
            const shouldRun = ch._zod.def.when(payload);
            if (!shouldRun)
              continue;
          } else if (isAborted) {
            continue;
          }
          const currLen = payload.issues.length;
          const _ = ch._zod.check(payload);
          if (_ instanceof Promise && ctx?.async === false) {
            throw new $ZodAsyncError();
          }
          if (asyncResult || _ instanceof Promise) {
            asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
              await _;
              const nextLen = payload.issues.length;
              if (nextLen === currLen)
                return;
              if (!isAborted)
                isAborted = aborted(payload, currLen);
            });
          } else {
            const nextLen = payload.issues.length;
            if (nextLen === currLen)
              continue;
            if (!isAborted)
              isAborted = aborted(payload, currLen);
          }
        }
        if (asyncResult) {
          return asyncResult.then(() => {
            return payload;
          });
        }
        return payload;
      };
      const handleCanaryResult = (canary, payload, ctx) => {
        if (aborted(canary)) {
          canary.aborted = true;
          return canary;
        }
        const checkResult = runChecks(payload, checks, ctx);
        if (checkResult instanceof Promise) {
          if (ctx.async === false)
            throw new $ZodAsyncError();
          return checkResult.then((checkResult2) => inst._zod.parse(checkResult2, ctx));
        }
        return inst._zod.parse(checkResult, ctx);
      };
      inst._zod.run = (payload, ctx) => {
        if (ctx.skipChecks) {
          return inst._zod.parse(payload, ctx);
        }
        if (ctx.direction === "backward") {
          const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
          if (canary instanceof Promise) {
            return canary.then((canary2) => {
              return handleCanaryResult(canary2, payload, ctx);
            });
          }
          return handleCanaryResult(canary, payload, ctx);
        }
        const result = inst._zod.parse(payload, ctx);
        if (result instanceof Promise) {
          if (ctx.async === false)
            throw new $ZodAsyncError();
          return result.then((result2) => runChecks(result2, checks, ctx));
        }
        return runChecks(result, checks, ctx);
      };
    }
    inst["~standard"] = {
      validate: (value) => {
        try {
          const r = safeParse(inst, value);
          return r.success ? { value: r.data } : { issues: r.error?.issues };
        } catch (_) {
          return safeParseAsync(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
        }
      },
      vendor: "zod",
      version: 1
    };
  });
  var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string(inst._zod.bag);
    inst._zod.parse = (payload, _) => {
      if (def.coerce)
        try {
          payload.value = String(payload.value);
        } catch (_2) {
        }
      if (typeof payload.value === "string")
        return payload;
      payload.issues.push({
        expected: "string",
        code: "invalid_type",
        input: payload.value,
        inst
      });
      return payload;
    };
  });
  var $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
    $ZodCheckStringFormat.init(inst, def);
    $ZodString.init(inst, def);
  });
  var $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
    def.pattern ?? (def.pattern = guid);
    $ZodStringFormat.init(inst, def);
  });
  var $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
    if (def.version) {
      const versionMap = {
        v1: 1,
        v2: 2,
        v3: 3,
        v4: 4,
        v5: 5,
        v6: 6,
        v7: 7,
        v8: 8
      };
      const v = versionMap[def.version];
      if (v === void 0)
        throw new Error(`Invalid UUID version: "${def.version}"`);
      def.pattern ?? (def.pattern = uuid(v));
    } else
      def.pattern ?? (def.pattern = uuid());
    $ZodStringFormat.init(inst, def);
  });
  var $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
    def.pattern ?? (def.pattern = email);
    $ZodStringFormat.init(inst, def);
  });
  var $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
      try {
        const trimmed = payload.value.trim();
        const url2 = new URL(trimmed);
        if (def.hostname) {
          def.hostname.lastIndex = 0;
          if (!def.hostname.test(url2.hostname)) {
            payload.issues.push({
              code: "invalid_format",
              format: "url",
              note: "Invalid hostname",
              pattern: def.hostname.source,
              input: payload.value,
              inst,
              continue: !def.abort
            });
          }
        }
        if (def.protocol) {
          def.protocol.lastIndex = 0;
          if (!def.protocol.test(url2.protocol.endsWith(":") ? url2.protocol.slice(0, -1) : url2.protocol)) {
            payload.issues.push({
              code: "invalid_format",
              format: "url",
              note: "Invalid protocol",
              pattern: def.protocol.source,
              input: payload.value,
              inst,
              continue: !def.abort
            });
          }
        }
        if (def.normalize) {
          payload.value = url2.href;
        } else {
          payload.value = trimmed;
        }
        return;
      } catch (_) {
        payload.issues.push({
          code: "invalid_format",
          format: "url",
          input: payload.value,
          inst,
          continue: !def.abort
        });
      }
    };
  });
  var $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
    def.pattern ?? (def.pattern = emoji());
    $ZodStringFormat.init(inst, def);
  });
  var $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
    def.pattern ?? (def.pattern = nanoid);
    $ZodStringFormat.init(inst, def);
  });
  var $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
    def.pattern ?? (def.pattern = cuid);
    $ZodStringFormat.init(inst, def);
  });
  var $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
    def.pattern ?? (def.pattern = cuid2);
    $ZodStringFormat.init(inst, def);
  });
  var $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
    def.pattern ?? (def.pattern = ulid);
    $ZodStringFormat.init(inst, def);
  });
  var $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
    def.pattern ?? (def.pattern = xid);
    $ZodStringFormat.init(inst, def);
  });
  var $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
    def.pattern ?? (def.pattern = ksuid);
    $ZodStringFormat.init(inst, def);
  });
  var $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
    def.pattern ?? (def.pattern = datetime(def));
    $ZodStringFormat.init(inst, def);
  });
  var $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
    def.pattern ?? (def.pattern = date);
    $ZodStringFormat.init(inst, def);
  });
  var $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
    def.pattern ?? (def.pattern = time(def));
    $ZodStringFormat.init(inst, def);
  });
  var $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
    def.pattern ?? (def.pattern = duration);
    $ZodStringFormat.init(inst, def);
  });
  var $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
    def.pattern ?? (def.pattern = ipv4);
    $ZodStringFormat.init(inst, def);
    inst._zod.bag.format = `ipv4`;
  });
  var $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
    def.pattern ?? (def.pattern = ipv6);
    $ZodStringFormat.init(inst, def);
    inst._zod.bag.format = `ipv6`;
    inst._zod.check = (payload) => {
      try {
        new URL(`http://[${payload.value}]`);
      } catch {
        payload.issues.push({
          code: "invalid_format",
          format: "ipv6",
          input: payload.value,
          inst,
          continue: !def.abort
        });
      }
    };
  });
  var $ZodMAC = /* @__PURE__ */ $constructor("$ZodMAC", (inst, def) => {
    def.pattern ?? (def.pattern = mac(def.delimiter));
    $ZodStringFormat.init(inst, def);
    inst._zod.bag.format = `mac`;
  });
  var $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
    def.pattern ?? (def.pattern = cidrv4);
    $ZodStringFormat.init(inst, def);
  });
  var $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
    def.pattern ?? (def.pattern = cidrv6);
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
      const parts = payload.value.split("/");
      try {
        if (parts.length !== 2)
          throw new Error();
        const [address, prefix] = parts;
        if (!prefix)
          throw new Error();
        const prefixNum = Number(prefix);
        if (`${prefixNum}` !== prefix)
          throw new Error();
        if (prefixNum < 0 || prefixNum > 128)
          throw new Error();
        new URL(`http://[${address}]`);
      } catch {
        payload.issues.push({
          code: "invalid_format",
          format: "cidrv6",
          input: payload.value,
          inst,
          continue: !def.abort
        });
      }
    };
  });
  function isValidBase64(data) {
    if (data === "")
      return true;
    if (data.length % 4 !== 0)
      return false;
    try {
      atob(data);
      return true;
    } catch {
      return false;
    }
  }
  var $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
    def.pattern ?? (def.pattern = base64);
    $ZodStringFormat.init(inst, def);
    inst._zod.bag.contentEncoding = "base64";
    inst._zod.check = (payload) => {
      if (isValidBase64(payload.value))
        return;
      payload.issues.push({
        code: "invalid_format",
        format: "base64",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    };
  });
  function isValidBase64URL(data) {
    if (!base64url.test(data))
      return false;
    const base643 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
    const padded = base643.padEnd(Math.ceil(base643.length / 4) * 4, "=");
    return isValidBase64(padded);
  }
  var $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
    def.pattern ?? (def.pattern = base64url);
    $ZodStringFormat.init(inst, def);
    inst._zod.bag.contentEncoding = "base64url";
    inst._zod.check = (payload) => {
      if (isValidBase64URL(payload.value))
        return;
      payload.issues.push({
        code: "invalid_format",
        format: "base64url",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
    def.pattern ?? (def.pattern = e164);
    $ZodStringFormat.init(inst, def);
  });
  function isValidJWT(token, algorithm = null) {
    try {
      const tokensParts = token.split(".");
      if (tokensParts.length !== 3)
        return false;
      const [header] = tokensParts;
      if (!header)
        return false;
      const parsedHeader = JSON.parse(atob(header));
      if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
        return false;
      if (!parsedHeader.alg)
        return false;
      if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
        return false;
      return true;
    } catch {
      return false;
    }
  }
  var $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
      if (isValidJWT(payload.value, def.alg))
        return;
      payload.issues.push({
        code: "invalid_format",
        format: "jwt",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodCustomStringFormat = /* @__PURE__ */ $constructor("$ZodCustomStringFormat", (inst, def) => {
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
      if (def.fn(payload.value))
        return;
      payload.issues.push({
        code: "invalid_format",
        format: def.format,
        input: payload.value,
        inst,
        continue: !def.abort
      });
    };
  });
  var $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = inst._zod.bag.pattern ?? number;
    inst._zod.parse = (payload, _ctx) => {
      if (def.coerce)
        try {
          payload.value = Number(payload.value);
        } catch (_) {
        }
      const input = payload.value;
      if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
        return payload;
      }
      const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
      payload.issues.push({
        expected: "number",
        code: "invalid_type",
        input,
        inst,
        ...received ? { received } : {}
      });
      return payload;
    };
  });
  var $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
    $ZodCheckNumberFormat.init(inst, def);
    $ZodNumber.init(inst, def);
  });
  var $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = boolean;
    inst._zod.parse = (payload, _ctx) => {
      if (def.coerce)
        try {
          payload.value = Boolean(payload.value);
        } catch (_) {
        }
      const input = payload.value;
      if (typeof input === "boolean")
        return payload;
      payload.issues.push({
        expected: "boolean",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    };
  });
  var $ZodBigInt = /* @__PURE__ */ $constructor("$ZodBigInt", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = bigint;
    inst._zod.parse = (payload, _ctx) => {
      if (def.coerce)
        try {
          payload.value = BigInt(payload.value);
        } catch (_) {
        }
      if (typeof payload.value === "bigint")
        return payload;
      payload.issues.push({
        expected: "bigint",
        code: "invalid_type",
        input: payload.value,
        inst
      });
      return payload;
    };
  });
  var $ZodBigIntFormat = /* @__PURE__ */ $constructor("$ZodBigIntFormat", (inst, def) => {
    $ZodCheckBigIntFormat.init(inst, def);
    $ZodBigInt.init(inst, def);
  });
  var $ZodSymbol = /* @__PURE__ */ $constructor("$ZodSymbol", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
      const input = payload.value;
      if (typeof input === "symbol")
        return payload;
      payload.issues.push({
        expected: "symbol",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    };
  });
  var $ZodUndefined = /* @__PURE__ */ $constructor("$ZodUndefined", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = _undefined;
    inst._zod.values = /* @__PURE__ */ new Set([void 0]);
    inst._zod.optin = "optional";
    inst._zod.optout = "optional";
    inst._zod.parse = (payload, _ctx) => {
      const input = payload.value;
      if (typeof input === "undefined")
        return payload;
      payload.issues.push({
        expected: "undefined",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    };
  });
  var $ZodNull = /* @__PURE__ */ $constructor("$ZodNull", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = _null;
    inst._zod.values = /* @__PURE__ */ new Set([null]);
    inst._zod.parse = (payload, _ctx) => {
      const input = payload.value;
      if (input === null)
        return payload;
      payload.issues.push({
        expected: "null",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    };
  });
  var $ZodAny = /* @__PURE__ */ $constructor("$ZodAny", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload) => payload;
  });
  var $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload) => payload;
  });
  var $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
      payload.issues.push({
        expected: "never",
        code: "invalid_type",
        input: payload.value,
        inst
      });
      return payload;
    };
  });
  var $ZodVoid = /* @__PURE__ */ $constructor("$ZodVoid", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
      const input = payload.value;
      if (typeof input === "undefined")
        return payload;
      payload.issues.push({
        expected: "void",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    };
  });
  var $ZodDate = /* @__PURE__ */ $constructor("$ZodDate", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
      if (def.coerce) {
        try {
          payload.value = new Date(payload.value);
        } catch (_err) {
        }
      }
      const input = payload.value;
      const isDate = input instanceof Date;
      const isValidDate = isDate && !Number.isNaN(input.getTime());
      if (isValidDate)
        return payload;
      payload.issues.push({
        expected: "date",
        code: "invalid_type",
        input,
        ...isDate ? { received: "Invalid Date" } : {},
        inst
      });
      return payload;
    };
  });
  function handleArrayResult(result, final, index) {
    if (result.issues.length) {
      final.issues.push(...prefixIssues(index, result.issues));
    }
    final.value[index] = result.value;
  }
  var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
      const input = payload.value;
      if (!Array.isArray(input)) {
        payload.issues.push({
          expected: "array",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      }
      payload.value = Array(input.length);
      const proms = [];
      for (let i = 0; i < input.length; i++) {
        const item = input[i];
        const result = def.element._zod.run({
          value: item,
          issues: []
        }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result2) => handleArrayResult(result2, payload, i)));
        } else {
          handleArrayResult(result, payload, i);
        }
      }
      if (proms.length) {
        return Promise.all(proms).then(() => payload);
      }
      return payload;
    };
  });
  function handlePropertyResult(result, final, key, input) {
    if (result.issues.length) {
      final.issues.push(...prefixIssues(key, result.issues));
    }
    if (result.value === void 0) {
      if (key in input) {
        final.value[key] = void 0;
      }
    } else {
      final.value[key] = result.value;
    }
  }
  function normalizeDef(def) {
    const keys = Object.keys(def.shape);
    for (const k of keys) {
      if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
        throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
      }
    }
    const okeys = optionalKeys(def.shape);
    return {
      ...def,
      keys,
      keySet: new Set(keys),
      numKeys: keys.length,
      optionalKeys: new Set(okeys)
    };
  }
  function handleCatchall(proms, input, payload, ctx, def, inst) {
    const unrecognized = [];
    const keySet = def.keySet;
    const _catchall = def.catchall._zod;
    const t = _catchall.def.type;
    for (const key in input) {
      if (keySet.has(key))
        continue;
      if (t === "never") {
        unrecognized.push(key);
        continue;
      }
      const r = _catchall.run({ value: input[key], issues: [] }, ctx);
      if (r instanceof Promise) {
        proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input)));
      } else {
        handlePropertyResult(r, payload, key, input);
      }
    }
    if (unrecognized.length) {
      payload.issues.push({
        code: "unrecognized_keys",
        keys: unrecognized,
        input,
        inst
      });
    }
    if (!proms.length)
      return payload;
    return Promise.all(proms).then(() => {
      return payload;
    });
  }
  var $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
    $ZodType.init(inst, def);
    const desc = Object.getOwnPropertyDescriptor(def, "shape");
    if (!desc?.get) {
      const sh = def.shape;
      Object.defineProperty(def, "shape", {
        get: () => {
          const newSh = { ...sh };
          Object.defineProperty(def, "shape", {
            value: newSh
          });
          return newSh;
        }
      });
    }
    const _normalized = cached(() => normalizeDef(def));
    defineLazy(inst._zod, "propValues", () => {
      const shape = def.shape;
      const propValues = {};
      for (const key in shape) {
        const field = shape[key]._zod;
        if (field.values) {
          propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
          for (const v of field.values)
            propValues[key].add(v);
        }
      }
      return propValues;
    });
    const isObject3 = isObject;
    const catchall = def.catchall;
    let value;
    inst._zod.parse = (payload, ctx) => {
      value ?? (value = _normalized.value);
      const input = payload.value;
      if (!isObject3(input)) {
        payload.issues.push({
          expected: "object",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      }
      payload.value = {};
      const proms = [];
      const shape = value.shape;
      for (const key of value.keys) {
        const el = shape[key];
        const r = el._zod.run({ value: input[key], issues: [] }, ctx);
        if (r instanceof Promise) {
          proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input)));
        } else {
          handlePropertyResult(r, payload, key, input);
        }
      }
      if (!catchall) {
        return proms.length ? Promise.all(proms).then(() => payload) : payload;
      }
      return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
    };
  });
  var $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
    $ZodObject.init(inst, def);
    const superParse = inst._zod.parse;
    const _normalized = cached(() => normalizeDef(def));
    const generateFastpass = (shape) => {
      const doc = new Doc(["shape", "payload", "ctx"]);
      const normalized = _normalized.value;
      const parseStr = (key) => {
        const k = esc(key);
        return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
      };
      doc.write(`const input = payload.value;`);
      const ids = /* @__PURE__ */ Object.create(null);
      let counter = 0;
      for (const key of normalized.keys) {
        ids[key] = `key_${counter++}`;
      }
      doc.write(`const newResult = {};`);
      for (const key of normalized.keys) {
        const id = ids[key];
        const k = esc(key);
        doc.write(`const ${id} = ${parseStr(key)};`);
        doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
      }
      doc.write(`payload.value = newResult;`);
      doc.write(`return payload;`);
      const fn = doc.compile();
      return (payload, ctx) => fn(shape, payload, ctx);
    };
    let fastpass;
    const isObject3 = isObject;
    const jit = !globalConfig.jitless;
    const allowsEval2 = allowsEval;
    const fastEnabled = jit && allowsEval2.value;
    const catchall = def.catchall;
    let value;
    inst._zod.parse = (payload, ctx) => {
      value ?? (value = _normalized.value);
      const input = payload.value;
      if (!isObject3(input)) {
        payload.issues.push({
          expected: "object",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      }
      if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
        if (!fastpass)
          fastpass = generateFastpass(def.shape);
        payload = fastpass(payload, ctx);
        if (!catchall)
          return payload;
        return handleCatchall([], input, payload, ctx, value, inst);
      }
      return superParse(payload, ctx);
    };
  });
  function handleUnionResults(results, final, inst, ctx) {
    for (const result of results) {
      if (result.issues.length === 0) {
        final.value = result.value;
        return final;
      }
    }
    const nonaborted = results.filter((r) => !aborted(r));
    if (nonaborted.length === 1) {
      final.value = nonaborted[0].value;
      return nonaborted[0];
    }
    final.issues.push({
      code: "invalid_union",
      input: final.value,
      inst,
      errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
    });
    return final;
  }
  var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
    defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
    defineLazy(inst._zod, "values", () => {
      if (def.options.every((o) => o._zod.values)) {
        return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
      }
      return void 0;
    });
    defineLazy(inst._zod, "pattern", () => {
      if (def.options.every((o) => o._zod.pattern)) {
        const patterns = def.options.map((o) => o._zod.pattern);
        return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
      }
      return void 0;
    });
    const single = def.options.length === 1;
    const first = def.options[0]._zod.run;
    inst._zod.parse = (payload, ctx) => {
      if (single) {
        return first(payload, ctx);
      }
      let async = false;
      const results = [];
      for (const option of def.options) {
        const result = option._zod.run({
          value: payload.value,
          issues: []
        }, ctx);
        if (result instanceof Promise) {
          results.push(result);
          async = true;
        } else {
          if (result.issues.length === 0)
            return result;
          results.push(result);
        }
      }
      if (!async)
        return handleUnionResults(results, payload, inst, ctx);
      return Promise.all(results).then((results2) => {
        return handleUnionResults(results2, payload, inst, ctx);
      });
    };
  });
  function handleExclusiveUnionResults(results, final, inst, ctx) {
    const successes = results.filter((r) => r.issues.length === 0);
    if (successes.length === 1) {
      final.value = successes[0].value;
      return final;
    }
    if (successes.length === 0) {
      final.issues.push({
        code: "invalid_union",
        input: final.value,
        inst,
        errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
      });
    } else {
      final.issues.push({
        code: "invalid_union",
        input: final.value,
        inst,
        errors: [],
        inclusive: false
      });
    }
    return final;
  }
  var $ZodXor = /* @__PURE__ */ $constructor("$ZodXor", (inst, def) => {
    $ZodUnion.init(inst, def);
    def.inclusive = false;
    const single = def.options.length === 1;
    const first = def.options[0]._zod.run;
    inst._zod.parse = (payload, ctx) => {
      if (single) {
        return first(payload, ctx);
      }
      let async = false;
      const results = [];
      for (const option of def.options) {
        const result = option._zod.run({
          value: payload.value,
          issues: []
        }, ctx);
        if (result instanceof Promise) {
          results.push(result);
          async = true;
        } else {
          results.push(result);
        }
      }
      if (!async)
        return handleExclusiveUnionResults(results, payload, inst, ctx);
      return Promise.all(results).then((results2) => {
        return handleExclusiveUnionResults(results2, payload, inst, ctx);
      });
    };
  });
  var $ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
    def.inclusive = false;
    $ZodUnion.init(inst, def);
    const _super = inst._zod.parse;
    defineLazy(inst._zod, "propValues", () => {
      const propValues = {};
      for (const option of def.options) {
        const pv = option._zod.propValues;
        if (!pv || Object.keys(pv).length === 0)
          throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
        for (const [k, v] of Object.entries(pv)) {
          if (!propValues[k])
            propValues[k] = /* @__PURE__ */ new Set();
          for (const val of v) {
            propValues[k].add(val);
          }
        }
      }
      return propValues;
    });
    const disc = cached(() => {
      const opts = def.options;
      const map2 = /* @__PURE__ */ new Map();
      for (const o of opts) {
        const values = o._zod.propValues?.[def.discriminator];
        if (!values || values.size === 0)
          throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o)}"`);
        for (const v of values) {
          if (map2.has(v)) {
            throw new Error(`Duplicate discriminator value "${String(v)}"`);
          }
          map2.set(v, o);
        }
      }
      return map2;
    });
    inst._zod.parse = (payload, ctx) => {
      const input = payload.value;
      if (!isObject(input)) {
        payload.issues.push({
          code: "invalid_type",
          expected: "object",
          input,
          inst
        });
        return payload;
      }
      const opt = disc.value.get(input?.[def.discriminator]);
      if (opt) {
        return opt._zod.run(payload, ctx);
      }
      if (def.unionFallback) {
        return _super(payload, ctx);
      }
      payload.issues.push({
        code: "invalid_union",
        errors: [],
        note: "No matching discriminator",
        discriminator: def.discriminator,
        input,
        path: [def.discriminator],
        inst
      });
      return payload;
    };
  });
  var $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
      const input = payload.value;
      const left = def.left._zod.run({ value: input, issues: [] }, ctx);
      const right = def.right._zod.run({ value: input, issues: [] }, ctx);
      const async = left instanceof Promise || right instanceof Promise;
      if (async) {
        return Promise.all([left, right]).then(([left2, right2]) => {
          return handleIntersectionResults(payload, left2, right2);
        });
      }
      return handleIntersectionResults(payload, left, right);
    };
  });
  function mergeValues(a, b) {
    if (a === b) {
      return { valid: true, data: a };
    }
    if (a instanceof Date && b instanceof Date && +a === +b) {
      return { valid: true, data: a };
    }
    if (isPlainObject(a) && isPlainObject(b)) {
      const bKeys = Object.keys(b);
      const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
      const newObj = { ...a, ...b };
      for (const key of sharedKeys) {
        const sharedValue = mergeValues(a[key], b[key]);
        if (!sharedValue.valid) {
          return {
            valid: false,
            mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
          };
        }
        newObj[key] = sharedValue.data;
      }
      return { valid: true, data: newObj };
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return { valid: false, mergeErrorPath: [] };
      }
      const newArray = [];
      for (let index = 0; index < a.length; index++) {
        const itemA = a[index];
        const itemB = b[index];
        const sharedValue = mergeValues(itemA, itemB);
        if (!sharedValue.valid) {
          return {
            valid: false,
            mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
          };
        }
        newArray.push(sharedValue.data);
      }
      return { valid: true, data: newArray };
    }
    return { valid: false, mergeErrorPath: [] };
  }
  function handleIntersectionResults(result, left, right) {
    if (left.issues.length) {
      result.issues.push(...left.issues);
    }
    if (right.issues.length) {
      result.issues.push(...right.issues);
    }
    if (aborted(result))
      return result;
    const merged = mergeValues(left.value, right.value);
    if (!merged.valid) {
      throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
    }
    result.value = merged.data;
    return result;
  }
  var $ZodTuple = /* @__PURE__ */ $constructor("$ZodTuple", (inst, def) => {
    $ZodType.init(inst, def);
    const items = def.items;
    inst._zod.parse = (payload, ctx) => {
      const input = payload.value;
      if (!Array.isArray(input)) {
        payload.issues.push({
          input,
          inst,
          expected: "tuple",
          code: "invalid_type"
        });
        return payload;
      }
      payload.value = [];
      const proms = [];
      const reversedIndex = [...items].reverse().findIndex((item) => item._zod.optin !== "optional");
      const optStart = reversedIndex === -1 ? 0 : items.length - reversedIndex;
      if (!def.rest) {
        const tooBig = input.length > items.length;
        const tooSmall = input.length < optStart - 1;
        if (tooBig || tooSmall) {
          payload.issues.push({
            ...tooBig ? { code: "too_big", maximum: items.length } : { code: "too_small", minimum: items.length },
            input,
            inst,
            origin: "array"
          });
          return payload;
        }
      }
      let i = -1;
      for (const item of items) {
        i++;
        if (i >= input.length) {
          if (i >= optStart)
            continue;
        }
        const result = item._zod.run({
          value: input[i],
          issues: []
        }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result2) => handleTupleResult(result2, payload, i)));
        } else {
          handleTupleResult(result, payload, i);
        }
      }
      if (def.rest) {
        const rest = input.slice(items.length);
        for (const el of rest) {
          i++;
          const result = def.rest._zod.run({
            value: el,
            issues: []
          }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result2) => handleTupleResult(result2, payload, i)));
          } else {
            handleTupleResult(result, payload, i);
          }
        }
      }
      if (proms.length)
        return Promise.all(proms).then(() => payload);
      return payload;
    };
  });
  function handleTupleResult(result, final, index) {
    if (result.issues.length) {
      final.issues.push(...prefixIssues(index, result.issues));
    }
    final.value[index] = result.value;
  }
  var $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
      const input = payload.value;
      if (!isPlainObject(input)) {
        payload.issues.push({
          expected: "record",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      }
      const proms = [];
      const values = def.keyType._zod.values;
      if (values) {
        payload.value = {};
        const recordKeys = /* @__PURE__ */ new Set();
        for (const key of values) {
          if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
            recordKeys.add(typeof key === "number" ? key.toString() : key);
            const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
            if (result instanceof Promise) {
              proms.push(result.then((result2) => {
                if (result2.issues.length) {
                  payload.issues.push(...prefixIssues(key, result2.issues));
                }
                payload.value[key] = result2.value;
              }));
            } else {
              if (result.issues.length) {
                payload.issues.push(...prefixIssues(key, result.issues));
              }
              payload.value[key] = result.value;
            }
          }
        }
        let unrecognized;
        for (const key in input) {
          if (!recordKeys.has(key)) {
            unrecognized = unrecognized ?? [];
            unrecognized.push(key);
          }
        }
        if (unrecognized && unrecognized.length > 0) {
          payload.issues.push({
            code: "unrecognized_keys",
            input,
            inst,
            keys: unrecognized
          });
        }
      } else {
        payload.value = {};
        for (const key of Reflect.ownKeys(input)) {
          if (key === "__proto__")
            continue;
          const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
          if (keyResult instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          if (keyResult.issues.length) {
            if (def.mode === "loose") {
              payload.value[key] = input[key];
            } else {
              payload.issues.push({
                code: "invalid_key",
                origin: "record",
                issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                input: key,
                path: [key],
                inst
              });
            }
            continue;
          }
          const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result2) => {
              if (result2.issues.length) {
                payload.issues.push(...prefixIssues(key, result2.issues));
              }
              payload.value[keyResult.value] = result2.value;
            }));
          } else {
            if (result.issues.length) {
              payload.issues.push(...prefixIssues(key, result.issues));
            }
            payload.value[keyResult.value] = result.value;
          }
        }
      }
      if (proms.length) {
        return Promise.all(proms).then(() => payload);
      }
      return payload;
    };
  });
  var $ZodMap = /* @__PURE__ */ $constructor("$ZodMap", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
      const input = payload.value;
      if (!(input instanceof Map)) {
        payload.issues.push({
          expected: "map",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      }
      const proms = [];
      payload.value = /* @__PURE__ */ new Map();
      for (const [key, value] of input) {
        const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
        const valueResult = def.valueType._zod.run({ value, issues: [] }, ctx);
        if (keyResult instanceof Promise || valueResult instanceof Promise) {
          proms.push(Promise.all([keyResult, valueResult]).then(([keyResult2, valueResult2]) => {
            handleMapResult(keyResult2, valueResult2, payload, key, input, inst, ctx);
          }));
        } else {
          handleMapResult(keyResult, valueResult, payload, key, input, inst, ctx);
        }
      }
      if (proms.length)
        return Promise.all(proms).then(() => payload);
      return payload;
    };
  });
  function handleMapResult(keyResult, valueResult, final, key, input, inst, ctx) {
    if (keyResult.issues.length) {
      if (propertyKeyTypes.has(typeof key)) {
        final.issues.push(...prefixIssues(key, keyResult.issues));
      } else {
        final.issues.push({
          code: "invalid_key",
          origin: "map",
          input,
          inst,
          issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config()))
        });
      }
    }
    if (valueResult.issues.length) {
      if (propertyKeyTypes.has(typeof key)) {
        final.issues.push(...prefixIssues(key, valueResult.issues));
      } else {
        final.issues.push({
          origin: "map",
          code: "invalid_element",
          input,
          inst,
          key,
          issues: valueResult.issues.map((iss) => finalizeIssue(iss, ctx, config()))
        });
      }
    }
    final.value.set(keyResult.value, valueResult.value);
  }
  var $ZodSet = /* @__PURE__ */ $constructor("$ZodSet", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
      const input = payload.value;
      if (!(input instanceof Set)) {
        payload.issues.push({
          input,
          inst,
          expected: "set",
          code: "invalid_type"
        });
        return payload;
      }
      const proms = [];
      payload.value = /* @__PURE__ */ new Set();
      for (const item of input) {
        const result = def.valueType._zod.run({ value: item, issues: [] }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result2) => handleSetResult(result2, payload)));
        } else
          handleSetResult(result, payload);
      }
      if (proms.length)
        return Promise.all(proms).then(() => payload);
      return payload;
    };
  });
  function handleSetResult(result, final) {
    if (result.issues.length) {
      final.issues.push(...result.issues);
    }
    final.value.add(result.value);
  }
  var $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
    $ZodType.init(inst, def);
    const values = getEnumValues(def.entries);
    const valuesSet = new Set(values);
    inst._zod.values = valuesSet;
    inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
    inst._zod.parse = (payload, _ctx) => {
      const input = payload.value;
      if (valuesSet.has(input)) {
        return payload;
      }
      payload.issues.push({
        code: "invalid_value",
        values,
        input,
        inst
      });
      return payload;
    };
  });
  var $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
    $ZodType.init(inst, def);
    if (def.values.length === 0) {
      throw new Error("Cannot create literal schema with no valid values");
    }
    const values = new Set(def.values);
    inst._zod.values = values;
    inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
    inst._zod.parse = (payload, _ctx) => {
      const input = payload.value;
      if (values.has(input)) {
        return payload;
      }
      payload.issues.push({
        code: "invalid_value",
        values: def.values,
        input,
        inst
      });
      return payload;
    };
  });
  var $ZodFile = /* @__PURE__ */ $constructor("$ZodFile", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
      const input = payload.value;
      if (input instanceof File)
        return payload;
      payload.issues.push({
        expected: "file",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    };
  });
  var $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
      if (ctx.direction === "backward") {
        throw new $ZodEncodeError(inst.constructor.name);
      }
      const _out = def.transform(payload.value, payload);
      if (ctx.async) {
        const output = _out instanceof Promise ? _out : Promise.resolve(_out);
        return output.then((output2) => {
          payload.value = output2;
          return payload;
        });
      }
      if (_out instanceof Promise) {
        throw new $ZodAsyncError();
      }
      payload.value = _out;
      return payload;
    };
  });
  function handleOptionalResult(result, input) {
    if (result.issues.length && input === void 0) {
      return { issues: [], value: void 0 };
    }
    return result;
  }
  var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.optin = "optional";
    inst._zod.optout = "optional";
    defineLazy(inst._zod, "values", () => {
      return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
    });
    defineLazy(inst._zod, "pattern", () => {
      const pattern = def.innerType._zod.pattern;
      return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
    });
    inst._zod.parse = (payload, ctx) => {
      if (def.innerType._zod.optin === "optional") {
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise)
          return result.then((r) => handleOptionalResult(r, payload.value));
        return handleOptionalResult(result, payload.value);
      }
      if (payload.value === void 0) {
        return payload;
      }
      return def.innerType._zod.run(payload, ctx);
    };
  });
  var $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
    defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
    defineLazy(inst._zod, "pattern", () => {
      const pattern = def.innerType._zod.pattern;
      return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
    });
    defineLazy(inst._zod, "values", () => {
      return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
    });
    inst._zod.parse = (payload, ctx) => {
      if (payload.value === null)
        return payload;
      return def.innerType._zod.run(payload, ctx);
    };
  });
  var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.optin = "optional";
    defineLazy(inst._zod, "values", () => def.innerType._zod.values);
    inst._zod.parse = (payload, ctx) => {
      if (ctx.direction === "backward") {
        return def.innerType._zod.run(payload, ctx);
      }
      if (payload.value === void 0) {
        payload.value = def.defaultValue;
        return payload;
      }
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise) {
        return result.then((result2) => handleDefaultResult(result2, def));
      }
      return handleDefaultResult(result, def);
    };
  });
  function handleDefaultResult(payload, def) {
    if (payload.value === void 0) {
      payload.value = def.defaultValue;
    }
    return payload;
  }
  var $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.optin = "optional";
    defineLazy(inst._zod, "values", () => def.innerType._zod.values);
    inst._zod.parse = (payload, ctx) => {
      if (ctx.direction === "backward") {
        return def.innerType._zod.run(payload, ctx);
      }
      if (payload.value === void 0) {
        payload.value = def.defaultValue;
      }
      return def.innerType._zod.run(payload, ctx);
    };
  });
  var $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "values", () => {
      const v = def.innerType._zod.values;
      return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
    });
    inst._zod.parse = (payload, ctx) => {
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise) {
        return result.then((result2) => handleNonOptionalResult(result2, inst));
      }
      return handleNonOptionalResult(result, inst);
    };
  });
  function handleNonOptionalResult(payload, inst) {
    if (!payload.issues.length && payload.value === void 0) {
      payload.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: payload.value,
        inst
      });
    }
    return payload;
  }
  var $ZodSuccess = /* @__PURE__ */ $constructor("$ZodSuccess", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
      if (ctx.direction === "backward") {
        throw new $ZodEncodeError("ZodSuccess");
      }
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise) {
        return result.then((result2) => {
          payload.value = result2.issues.length === 0;
          return payload;
        });
      }
      payload.value = result.issues.length === 0;
      return payload;
    };
  });
  var $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
    defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
    defineLazy(inst._zod, "values", () => def.innerType._zod.values);
    inst._zod.parse = (payload, ctx) => {
      if (ctx.direction === "backward") {
        return def.innerType._zod.run(payload, ctx);
      }
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise) {
        return result.then((result2) => {
          payload.value = result2.value;
          if (result2.issues.length) {
            payload.value = def.catchValue({
              ...payload,
              error: {
                issues: result2.issues.map((iss) => finalizeIssue(iss, ctx, config()))
              },
              input: payload.value
            });
            payload.issues = [];
          }
          return payload;
        });
      }
      payload.value = result.value;
      if (result.issues.length) {
        payload.value = def.catchValue({
          ...payload,
          error: {
            issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
          },
          input: payload.value
        });
        payload.issues = [];
      }
      return payload;
    };
  });
  var $ZodNaN = /* @__PURE__ */ $constructor("$ZodNaN", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
      if (typeof payload.value !== "number" || !Number.isNaN(payload.value)) {
        payload.issues.push({
          input: payload.value,
          inst,
          expected: "nan",
          code: "invalid_type"
        });
        return payload;
      }
      return payload;
    };
  });
  var $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "values", () => def.in._zod.values);
    defineLazy(inst._zod, "optin", () => def.in._zod.optin);
    defineLazy(inst._zod, "optout", () => def.out._zod.optout);
    defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
    inst._zod.parse = (payload, ctx) => {
      if (ctx.direction === "backward") {
        const right = def.out._zod.run(payload, ctx);
        if (right instanceof Promise) {
          return right.then((right2) => handlePipeResult(right2, def.in, ctx));
        }
        return handlePipeResult(right, def.in, ctx);
      }
      const left = def.in._zod.run(payload, ctx);
      if (left instanceof Promise) {
        return left.then((left2) => handlePipeResult(left2, def.out, ctx));
      }
      return handlePipeResult(left, def.out, ctx);
    };
  });
  function handlePipeResult(left, next, ctx) {
    if (left.issues.length) {
      left.aborted = true;
      return left;
    }
    return next._zod.run({ value: left.value, issues: left.issues }, ctx);
  }
  var $ZodCodec = /* @__PURE__ */ $constructor("$ZodCodec", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "values", () => def.in._zod.values);
    defineLazy(inst._zod, "optin", () => def.in._zod.optin);
    defineLazy(inst._zod, "optout", () => def.out._zod.optout);
    defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
    inst._zod.parse = (payload, ctx) => {
      const direction = ctx.direction || "forward";
      if (direction === "forward") {
        const left = def.in._zod.run(payload, ctx);
        if (left instanceof Promise) {
          return left.then((left2) => handleCodecAResult(left2, def, ctx));
        }
        return handleCodecAResult(left, def, ctx);
      } else {
        const right = def.out._zod.run(payload, ctx);
        if (right instanceof Promise) {
          return right.then((right2) => handleCodecAResult(right2, def, ctx));
        }
        return handleCodecAResult(right, def, ctx);
      }
    };
  });
  function handleCodecAResult(result, def, ctx) {
    if (result.issues.length) {
      result.aborted = true;
      return result;
    }
    const direction = ctx.direction || "forward";
    if (direction === "forward") {
      const transformed = def.transform(result.value, result);
      if (transformed instanceof Promise) {
        return transformed.then((value) => handleCodecTxResult(result, value, def.out, ctx));
      }
      return handleCodecTxResult(result, transformed, def.out, ctx);
    } else {
      const transformed = def.reverseTransform(result.value, result);
      if (transformed instanceof Promise) {
        return transformed.then((value) => handleCodecTxResult(result, value, def.in, ctx));
      }
      return handleCodecTxResult(result, transformed, def.in, ctx);
    }
  }
  function handleCodecTxResult(left, value, nextSchema, ctx) {
    if (left.issues.length) {
      left.aborted = true;
      return left;
    }
    return nextSchema._zod.run({ value, issues: left.issues }, ctx);
  }
  var $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
    defineLazy(inst._zod, "values", () => def.innerType._zod.values);
    defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
    defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
    inst._zod.parse = (payload, ctx) => {
      if (ctx.direction === "backward") {
        return def.innerType._zod.run(payload, ctx);
      }
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise) {
        return result.then(handleReadonlyResult);
      }
      return handleReadonlyResult(result);
    };
  });
  function handleReadonlyResult(payload) {
    payload.value = Object.freeze(payload.value);
    return payload;
  }
  var $ZodTemplateLiteral = /* @__PURE__ */ $constructor("$ZodTemplateLiteral", (inst, def) => {
    $ZodType.init(inst, def);
    const regexParts = [];
    for (const part of def.parts) {
      if (typeof part === "object" && part !== null) {
        if (!part._zod.pattern) {
          throw new Error(`Invalid template literal part, no pattern found: ${[...part._zod.traits].shift()}`);
        }
        const source = part._zod.pattern instanceof RegExp ? part._zod.pattern.source : part._zod.pattern;
        if (!source)
          throw new Error(`Invalid template literal part: ${part._zod.traits}`);
        const start = source.startsWith("^") ? 1 : 0;
        const end = source.endsWith("$") ? source.length - 1 : source.length;
        regexParts.push(source.slice(start, end));
      } else if (part === null || primitiveTypes.has(typeof part)) {
        regexParts.push(escapeRegex(`${part}`));
      } else {
        throw new Error(`Invalid template literal part: ${part}`);
      }
    }
    inst._zod.pattern = new RegExp(`^${regexParts.join("")}$`);
    inst._zod.parse = (payload, _ctx) => {
      if (typeof payload.value !== "string") {
        payload.issues.push({
          input: payload.value,
          inst,
          expected: "template_literal",
          code: "invalid_type"
        });
        return payload;
      }
      inst._zod.pattern.lastIndex = 0;
      if (!inst._zod.pattern.test(payload.value)) {
        payload.issues.push({
          input: payload.value,
          inst,
          code: "invalid_format",
          format: def.format ?? "template_literal",
          pattern: inst._zod.pattern.source
        });
        return payload;
      }
      return payload;
    };
  });
  var $ZodFunction = /* @__PURE__ */ $constructor("$ZodFunction", (inst, def) => {
    $ZodType.init(inst, def);
    inst._def = def;
    inst._zod.def = def;
    inst.implement = (func) => {
      if (typeof func !== "function") {
        throw new Error("implement() must be called with a function");
      }
      return function(...args) {
        const parsedArgs = inst._def.input ? parse(inst._def.input, args) : args;
        const result = Reflect.apply(func, this, parsedArgs);
        if (inst._def.output) {
          return parse(inst._def.output, result);
        }
        return result;
      };
    };
    inst.implementAsync = (func) => {
      if (typeof func !== "function") {
        throw new Error("implementAsync() must be called with a function");
      }
      return async function(...args) {
        const parsedArgs = inst._def.input ? await parseAsync(inst._def.input, args) : args;
        const result = await Reflect.apply(func, this, parsedArgs);
        if (inst._def.output) {
          return await parseAsync(inst._def.output, result);
        }
        return result;
      };
    };
    inst._zod.parse = (payload, _ctx) => {
      if (typeof payload.value !== "function") {
        payload.issues.push({
          code: "invalid_type",
          expected: "function",
          input: payload.value,
          inst
        });
        return payload;
      }
      const hasPromiseOutput = inst._def.output && inst._def.output._zod.def.type === "promise";
      if (hasPromiseOutput) {
        payload.value = inst.implementAsync(payload.value);
      } else {
        payload.value = inst.implement(payload.value);
      }
      return payload;
    };
    inst.input = (...args) => {
      const F = inst.constructor;
      if (Array.isArray(args[0])) {
        return new F({
          type: "function",
          input: new $ZodTuple({
            type: "tuple",
            items: args[0],
            rest: args[1]
          }),
          output: inst._def.output
        });
      }
      return new F({
        type: "function",
        input: args[0],
        output: inst._def.output
      });
    };
    inst.output = (output) => {
      const F = inst.constructor;
      return new F({
        type: "function",
        input: inst._def.input,
        output
      });
    };
    return inst;
  });
  var $ZodPromise = /* @__PURE__ */ $constructor("$ZodPromise", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
      return Promise.resolve(payload.value).then((inner) => def.innerType._zod.run({ value: inner, issues: [] }, ctx));
    };
  });
  var $ZodLazy = /* @__PURE__ */ $constructor("$ZodLazy", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "innerType", () => def.getter());
    defineLazy(inst._zod, "pattern", () => inst._zod.innerType?._zod?.pattern);
    defineLazy(inst._zod, "propValues", () => inst._zod.innerType?._zod?.propValues);
    defineLazy(inst._zod, "optin", () => inst._zod.innerType?._zod?.optin ?? void 0);
    defineLazy(inst._zod, "optout", () => inst._zod.innerType?._zod?.optout ?? void 0);
    inst._zod.parse = (payload, ctx) => {
      const inner = inst._zod.innerType;
      return inner._zod.run(payload, ctx);
    };
  });
  var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
    $ZodCheck.init(inst, def);
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _) => {
      return payload;
    };
    inst._zod.check = (payload) => {
      const input = payload.value;
      const r = def.fn(input);
      if (r instanceof Promise) {
        return r.then((r2) => handleRefineResult(r2, payload, input, inst));
      }
      handleRefineResult(r, payload, input, inst);
      return;
    };
  });
  function handleRefineResult(result, payload, input, inst) {
    if (!result) {
      const _iss = {
        code: "custom",
        input,
        inst,
        // incorporates params.error into issue reporting
        path: [...inst._zod.def.path ?? []],
        // incorporates params.error into issue reporting
        continue: !inst._zod.def.abort
        // params: inst._zod.def.params,
      };
      if (inst._zod.def.params)
        _iss.params = inst._zod.def.params;
      payload.issues.push(issue(_iss));
    }
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/index.js
  var locales_exports = {};
  __export(locales_exports, {
    ar: () => ar_default,
    az: () => az_default,
    be: () => be_default,
    bg: () => bg_default,
    ca: () => ca_default,
    cs: () => cs_default,
    da: () => da_default,
    de: () => de_default,
    en: () => en_default,
    eo: () => eo_default,
    es: () => es_default,
    fa: () => fa_default,
    fi: () => fi_default,
    fr: () => fr_default,
    frCA: () => fr_CA_default,
    he: () => he_default,
    hu: () => hu_default,
    id: () => id_default,
    is: () => is_default,
    it: () => it_default,
    ja: () => ja_default,
    ka: () => ka_default,
    kh: () => kh_default,
    km: () => km_default,
    ko: () => ko_default,
    lt: () => lt_default,
    mk: () => mk_default,
    ms: () => ms_default,
    nl: () => nl_default,
    no: () => no_default,
    ota: () => ota_default,
    pl: () => pl_default,
    ps: () => ps_default,
    pt: () => pt_default,
    ru: () => ru_default,
    sl: () => sl_default,
    sv: () => sv_default,
    ta: () => ta_default,
    th: () => th_default,
    tr: () => tr_default,
    ua: () => ua_default,
    uk: () => uk_default,
    ur: () => ur_default,
    vi: () => vi_default,
    yo: () => yo_default,
    zhCN: () => zh_CN_default,
    zhTW: () => zh_TW_default
  });

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ar.js
  var error = () => {
    const Sizable = {
      string: { unit: "\u062D\u0631\u0641", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
      file: { unit: "\u0628\u0627\u064A\u062A", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
      array: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
      set: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "number";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "array";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u0645\u062F\u062E\u0644",
      email: "\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
      url: "\u0631\u0627\u0628\u0637",
      emoji: "\u0625\u064A\u0645\u0648\u062C\u064A",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\u062A\u0627\u0631\u064A\u062E \u0648\u0648\u0642\u062A \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
      date: "\u062A\u0627\u0631\u064A\u062E \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
      time: "\u0648\u0642\u062A \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
      duration: "\u0645\u062F\u0629 \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
      ipv4: "\u0639\u0646\u0648\u0627\u0646 IPv4",
      ipv6: "\u0639\u0646\u0648\u0627\u0646 IPv6",
      cidrv4: "\u0645\u062F\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0628\u0635\u064A\u063A\u0629 IPv4",
      cidrv6: "\u0645\u062F\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0628\u0635\u064A\u063A\u0629 IPv6",
      base64: "\u0646\u064E\u0635 \u0628\u062A\u0631\u0645\u064A\u0632 base64-encoded",
      base64url: "\u0646\u064E\u0635 \u0628\u062A\u0631\u0645\u064A\u0632 base64url-encoded",
      json_string: "\u0646\u064E\u0635 \u0639\u0644\u0649 \u0647\u064A\u0626\u0629 JSON",
      e164: "\u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0628\u0645\u0639\u064A\u0627\u0631 E.164",
      jwt: "JWT",
      template_literal: "\u0645\u062F\u062E\u0644"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${issue2.expected}\u060C \u0648\u0644\u0643\u0646 \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${stringifyPrimitive(issue2.values[0])}`;
          return `\u0627\u062E\u062A\u064A\u0627\u0631 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062A\u0648\u0642\u0639 \u0627\u0646\u062A\u0642\u0627\u0621 \u0623\u062D\u062F \u0647\u0630\u0647 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A: ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return ` \u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${issue2.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0635\u0631"}`;
          return `\u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${issue2.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${adj} ${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${issue2.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${issue2.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${adj} ${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0628\u062F\u0623 \u0628\u0640 "${issue2.prefix}"`;
          if (_issue.format === "ends_with")
            return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0646\u062A\u0647\u064A \u0628\u0640 "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0636\u0645\u0651\u064E\u0646 "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0637\u0627\u0628\u0642 \u0627\u0644\u0646\u0645\u0637 ${_issue.pattern}`;
          return `${Nouns[_issue.format] ?? issue2.format} \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644`;
        }
        case "not_multiple_of":
          return `\u0631\u0642\u0645 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0646 \u0645\u0636\u0627\u0639\u0641\u0627\u062A ${issue2.divisor}`;
        case "unrecognized_keys":
          return `\u0645\u0639\u0631\u0641${issue2.keys.length > 1 ? "\u0627\u062A" : ""} \u063A\u0631\u064A\u0628${issue2.keys.length > 1 ? "\u0629" : ""}: ${joinValues(issue2.keys, "\u060C ")}`;
        case "invalid_key":
          return `\u0645\u0639\u0631\u0641 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${issue2.origin}`;
        case "invalid_union":
          return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644";
        case "invalid_element":
          return `\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${issue2.origin}`;
        default:
          return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644";
      }
    };
  };
  function ar_default() {
    return {
      localeError: error()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/az.js
  var error2 = () => {
    const Sizable = {
      string: { unit: "simvol", verb: "olmal\u0131d\u0131r" },
      file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
      array: { unit: "element", verb: "olmal\u0131d\u0131r" },
      set: { unit: "element", verb: "olmal\u0131d\u0131r" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "number";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "array";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "input",
      email: "email address",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO datetime",
      date: "ISO date",
      time: "ISO time",
      duration: "ISO duration",
      ipv4: "IPv4 address",
      ipv6: "IPv6 address",
      cidrv4: "IPv4 range",
      cidrv6: "IPv6 range",
      base64: "base64-encoded string",
      base64url: "base64url-encoded string",
      json_string: "JSON string",
      e164: "E.164 number",
      jwt: "JWT",
      template_literal: "input"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${issue2.expected}, daxil olan ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${stringifyPrimitive(issue2.values[0])}`;
          return `Yanl\u0131\u015F se\xE7im: a\u015Fa\u011F\u0131dak\u0131lardan biri olmal\u0131d\u0131r: ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${issue2.origin ?? "d\u0259y\u0259r"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "element"}`;
          return `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${issue2.origin ?? "d\u0259y\u0259r"} ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          return `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `Yanl\u0131\u015F m\u0259tn: "${_issue.prefix}" il\u0259 ba\u015Flamal\u0131d\u0131r`;
          if (_issue.format === "ends_with")
            return `Yanl\u0131\u015F m\u0259tn: "${_issue.suffix}" il\u0259 bitm\u0259lidir`;
          if (_issue.format === "includes")
            return `Yanl\u0131\u015F m\u0259tn: "${_issue.includes}" daxil olmal\u0131d\u0131r`;
          if (_issue.format === "regex")
            return `Yanl\u0131\u015F m\u0259tn: ${_issue.pattern} \u015Fablonuna uy\u011Fun olmal\u0131d\u0131r`;
          return `Yanl\u0131\u015F ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `Yanl\u0131\u015F \u0259d\u0259d: ${issue2.divisor} il\u0259 b\xF6l\xFCn\u0259 bil\u0259n olmal\u0131d\u0131r`;
        case "unrecognized_keys":
          return `Tan\u0131nmayan a\xE7ar${issue2.keys.length > 1 ? "lar" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `${issue2.origin} daxilind\u0259 yanl\u0131\u015F a\xE7ar`;
        case "invalid_union":
          return "Yanl\u0131\u015F d\u0259y\u0259r";
        case "invalid_element":
          return `${issue2.origin} daxilind\u0259 yanl\u0131\u015F d\u0259y\u0259r`;
        default:
          return `Yanl\u0131\u015F d\u0259y\u0259r`;
      }
    };
  };
  function az_default() {
    return {
      localeError: error2()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/be.js
  function getBelarusianPlural(count, one, few, many) {
    const absCount = Math.abs(count);
    const lastDigit = absCount % 10;
    const lastTwoDigits = absCount % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return many;
    }
    if (lastDigit === 1) {
      return one;
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return few;
    }
    return many;
  }
  var error3 = () => {
    const Sizable = {
      string: {
        unit: {
          one: "\u0441\u0456\u043C\u0432\u0430\u043B",
          few: "\u0441\u0456\u043C\u0432\u0430\u043B\u044B",
          many: "\u0441\u0456\u043C\u0432\u0430\u043B\u0430\u045E"
        },
        verb: "\u043C\u0435\u0446\u044C"
      },
      array: {
        unit: {
          one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
          few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B",
          many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u045E"
        },
        verb: "\u043C\u0435\u0446\u044C"
      },
      set: {
        unit: {
          one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
          few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B",
          many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u045E"
        },
        verb: "\u043C\u0435\u0446\u044C"
      },
      file: {
        unit: {
          one: "\u0431\u0430\u0439\u0442",
          few: "\u0431\u0430\u0439\u0442\u044B",
          many: "\u0431\u0430\u0439\u0442\u0430\u045E"
        },
        verb: "\u043C\u0435\u0446\u044C"
      }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "\u043B\u0456\u043A";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "\u043C\u0430\u0441\u0456\u045E";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u0443\u0432\u043E\u0434",
      email: "email \u0430\u0434\u0440\u0430\u0441",
      url: "URL",
      emoji: "\u044D\u043C\u043E\u0434\u0437\u0456",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0434\u0430\u0442\u0430 \u0456 \u0447\u0430\u0441",
      date: "ISO \u0434\u0430\u0442\u0430",
      time: "ISO \u0447\u0430\u0441",
      duration: "ISO \u043F\u0440\u0430\u0446\u044F\u0433\u043B\u0430\u0441\u0446\u044C",
      ipv4: "IPv4 \u0430\u0434\u0440\u0430\u0441",
      ipv6: "IPv6 \u0430\u0434\u0440\u0430\u0441",
      cidrv4: "IPv4 \u0434\u044B\u044F\u043F\u0430\u0437\u043E\u043D",
      cidrv6: "IPv6 \u0434\u044B\u044F\u043F\u0430\u0437\u043E\u043D",
      base64: "\u0440\u0430\u0434\u043E\u043A \u0443 \u0444\u0430\u0440\u043C\u0430\u0446\u0435 base64",
      base64url: "\u0440\u0430\u0434\u043E\u043A \u0443 \u0444\u0430\u0440\u043C\u0430\u0446\u0435 base64url",
      json_string: "JSON \u0440\u0430\u0434\u043E\u043A",
      e164: "\u043D\u0443\u043C\u0430\u0440 E.164",
      jwt: "JWT",
      template_literal: "\u0443\u0432\u043E\u0434"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u045E\u0441\u044F ${issue2.expected}, \u0430\u0442\u0440\u044B\u043C\u0430\u043D\u0430 ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F ${stringifyPrimitive(issue2.values[0])}`;
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0432\u0430\u0440\u044B\u044F\u043D\u0442: \u0447\u0430\u043A\u0430\u045E\u0441\u044F \u0430\u0434\u0437\u0456\u043D \u0437 ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            const maxValue = Number(issue2.maximum);
            const unit = getBelarusianPlural(maxValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
            return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${sizing.verb} ${adj}${issue2.maximum.toString()} ${unit}`;
          }
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            const minValue = Number(issue2.minimum);
            const unit = getBelarusianPlural(minValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
            return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${sizing.verb} ${adj}${issue2.minimum.toString()} ${unit}`;
          }
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u043F\u0430\u0447\u044B\u043D\u0430\u0446\u0446\u0430 \u0437 "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u0430\u043A\u0430\u043D\u0447\u0432\u0430\u0446\u0446\u0430 \u043D\u0430 "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u043C\u044F\u0448\u0447\u0430\u0446\u044C "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0430\u0434\u043F\u0430\u0432\u044F\u0434\u0430\u0446\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${_issue.pattern}`;
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043B\u0456\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0431\u044B\u0446\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${issue2.divisor}`;
        case "unrecognized_keys":
          return `\u041D\u0435\u0440\u0430\u0441\u043F\u0430\u0437\u043D\u0430\u043D\u044B ${issue2.keys.length > 1 ? "\u043A\u043B\u044E\u0447\u044B" : "\u043A\u043B\u044E\u0447"}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043A\u043B\u044E\u0447 \u0443 ${issue2.origin}`;
        case "invalid_union":
          return "\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434";
        case "invalid_element":
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u0430\u0435 \u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435 \u045E ${issue2.origin}`;
        default:
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434`;
      }
    };
  };
  function be_default() {
    return {
      localeError: error3()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/bg.js
  var parsedType = (data) => {
    const t = typeof data;
    switch (t) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "\u0447\u0438\u0441\u043B\u043E";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "\u043C\u0430\u0441\u0438\u0432";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t;
  };
  var error4 = () => {
    const Sizable = {
      string: { unit: "\u0441\u0438\u043C\u0432\u043E\u043B\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" },
      file: { unit: "\u0431\u0430\u0439\u0442\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" },
      array: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" },
      set: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const Nouns = {
      regex: "\u0432\u0445\u043E\u0434",
      email: "\u0438\u043C\u0435\u0439\u043B \u0430\u0434\u0440\u0435\u0441",
      url: "URL",
      emoji: "\u0435\u043C\u043E\u0434\u0436\u0438",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0432\u0440\u0435\u043C\u0435",
      date: "ISO \u0434\u0430\u0442\u0430",
      time: "ISO \u0432\u0440\u0435\u043C\u0435",
      duration: "ISO \u043F\u0440\u043E\u0434\u044A\u043B\u0436\u0438\u0442\u0435\u043B\u043D\u043E\u0441\u0442",
      ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441",
      ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441",
      cidrv4: "IPv4 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
      cidrv6: "IPv6 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
      base64: "base64-\u043A\u043E\u0434\u0438\u0440\u0430\u043D \u043D\u0438\u0437",
      base64url: "base64url-\u043A\u043E\u0434\u0438\u0440\u0430\u043D \u043D\u0438\u0437",
      json_string: "JSON \u043D\u0438\u0437",
      e164: "E.164 \u043D\u043E\u043C\u0435\u0440",
      jwt: "JWT",
      template_literal: "\u0432\u0445\u043E\u0434"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${issue2.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D ${parsedType(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${stringifyPrimitive(issue2.values[0])}`;
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 \u043E\u043F\u0446\u0438\u044F: \u043E\u0447\u0430\u043A\u0432\u0430\u043D\u043E \u0435\u0434\u043D\u043E \u043E\u0442 ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430"}`;
          return `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0431\u044A\u0434\u0435 ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin} \u0434\u0430 \u0431\u044A\u0434\u0435 ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u0432\u0430 \u0441 "${_issue.prefix}"`;
          }
          if (_issue.format === "ends_with")
            return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u0432\u044A\u0440\u0448\u0432\u0430 \u0441 "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0432\u043A\u043B\u044E\u0447\u0432\u0430 "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0441\u044A\u0432\u043F\u0430\u0434\u0430 \u0441 ${_issue.pattern}`;
          let invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D";
          if (_issue.format === "emoji")
            invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E";
          if (_issue.format === "datetime")
            invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E";
          if (_issue.format === "date")
            invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430";
          if (_issue.format === "time")
            invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E";
          if (_issue.format === "duration")
            invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430";
          return `${invalid_adj} ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E \u0447\u0438\u0441\u043B\u043E: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0431\u044A\u0434\u0435 \u043A\u0440\u0430\u0442\u043D\u043E \u043D\u0430 ${issue2.divisor}`;
        case "unrecognized_keys":
          return `\u041D\u0435\u0440\u0430\u0437\u043F\u043E\u0437\u043D\u0430\u0442${issue2.keys.length > 1 ? "\u0438" : ""} \u043A\u043B\u044E\u0447${issue2.keys.length > 1 ? "\u043E\u0432\u0435" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043A\u043B\u044E\u0447 \u0432 ${issue2.origin}`;
        case "invalid_union":
          return "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434";
        case "invalid_element":
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442 \u0432 ${issue2.origin}`;
        default:
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434`;
      }
    };
  };
  function bg_default() {
    return {
      localeError: error4()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ca.js
  var error5 = () => {
    const Sizable = {
      string: { unit: "car\xE0cters", verb: "contenir" },
      file: { unit: "bytes", verb: "contenir" },
      array: { unit: "elements", verb: "contenir" },
      set: { unit: "elements", verb: "contenir" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "number";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "array";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "entrada",
      email: "adre\xE7a electr\xF2nica",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "data i hora ISO",
      date: "data ISO",
      time: "hora ISO",
      duration: "durada ISO",
      ipv4: "adre\xE7a IPv4",
      ipv6: "adre\xE7a IPv6",
      cidrv4: "rang IPv4",
      cidrv6: "rang IPv6",
      base64: "cadena codificada en base64",
      base64url: "cadena codificada en base64url",
      json_string: "cadena JSON",
      e164: "n\xFAmero E.164",
      jwt: "JWT",
      template_literal: "entrada"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Tipus inv\xE0lid: s'esperava ${issue2.expected}, s'ha rebut ${parsedType8(issue2.input)}`;
        // return `Tipus invàlid: s'esperava ${issue.expected}, s'ha rebut ${util.getParsedType(issue.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Valor inv\xE0lid: s'esperava ${stringifyPrimitive(issue2.values[0])}`;
          return `Opci\xF3 inv\xE0lida: s'esperava una de ${joinValues(issue2.values, " o ")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "com a m\xE0xim" : "menys de";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `Massa gran: s'esperava que ${issue2.origin ?? "el valor"} contingu\xE9s ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "elements"}`;
          return `Massa gran: s'esperava que ${issue2.origin ?? "el valor"} fos ${adj} ${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? "com a m\xEDnim" : "m\xE9s de";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Massa petit: s'esperava que ${issue2.origin} contingu\xE9s ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `Massa petit: s'esperava que ${issue2.origin} fos ${adj} ${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `Format inv\xE0lid: ha de comen\xE7ar amb "${_issue.prefix}"`;
          }
          if (_issue.format === "ends_with")
            return `Format inv\xE0lid: ha d'acabar amb "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Format inv\xE0lid: ha d'incloure "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Format inv\xE0lid: ha de coincidir amb el patr\xF3 ${_issue.pattern}`;
          return `Format inv\xE0lid per a ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `N\xFAmero inv\xE0lid: ha de ser m\xFAltiple de ${issue2.divisor}`;
        case "unrecognized_keys":
          return `Clau${issue2.keys.length > 1 ? "s" : ""} no reconeguda${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Clau inv\xE0lida a ${issue2.origin}`;
        case "invalid_union":
          return "Entrada inv\xE0lida";
        // Could also be "Tipus d'unió invàlid" but "Entrada invàlida" is more general
        case "invalid_element":
          return `Element inv\xE0lid a ${issue2.origin}`;
        default:
          return `Entrada inv\xE0lida`;
      }
    };
  };
  function ca_default() {
    return {
      localeError: error5()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/cs.js
  var error6 = () => {
    const Sizable = {
      string: { unit: "znak\u016F", verb: "m\xEDt" },
      file: { unit: "bajt\u016F", verb: "m\xEDt" },
      array: { unit: "prvk\u016F", verb: "m\xEDt" },
      set: { unit: "prvk\u016F", verb: "m\xEDt" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "\u010D\xEDslo";
        }
        case "string": {
          return "\u0159et\u011Bzec";
        }
        case "boolean": {
          return "boolean";
        }
        case "bigint": {
          return "bigint";
        }
        case "function": {
          return "funkce";
        }
        case "symbol": {
          return "symbol";
        }
        case "undefined": {
          return "undefined";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "pole";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "regul\xE1rn\xED v\xFDraz",
      email: "e-mailov\xE1 adresa",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "datum a \u010Das ve form\xE1tu ISO",
      date: "datum ve form\xE1tu ISO",
      time: "\u010Das ve form\xE1tu ISO",
      duration: "doba trv\xE1n\xED ISO",
      ipv4: "IPv4 adresa",
      ipv6: "IPv6 adresa",
      cidrv4: "rozsah IPv4",
      cidrv6: "rozsah IPv6",
      base64: "\u0159et\u011Bzec zak\xF3dovan\xFD ve form\xE1tu base64",
      base64url: "\u0159et\u011Bzec zak\xF3dovan\xFD ve form\xE1tu base64url",
      json_string: "\u0159et\u011Bzec ve form\xE1tu JSON",
      e164: "\u010D\xEDslo E.164",
      jwt: "JWT",
      template_literal: "vstup"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${issue2.expected}, obdr\u017Eeno ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${stringifyPrimitive(issue2.values[0])}`;
          return `Neplatn\xE1 mo\u017Enost: o\u010Dek\xE1v\xE1na jedna z hodnot ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${issue2.origin ?? "hodnota"} mus\xED m\xEDt ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "prvk\u016F"}`;
          }
          return `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${issue2.origin ?? "hodnota"} mus\xED b\xFDt ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${issue2.origin ?? "hodnota"} mus\xED m\xEDt ${adj}${issue2.minimum.toString()} ${sizing.unit ?? "prvk\u016F"}`;
          }
          return `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${issue2.origin ?? "hodnota"} mus\xED b\xFDt ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `Neplatn\xFD \u0159et\u011Bzec: mus\xED za\u010D\xEDnat na "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `Neplatn\xFD \u0159et\u011Bzec: mus\xED kon\u010Dit na "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Neplatn\xFD \u0159et\u011Bzec: mus\xED obsahovat "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Neplatn\xFD \u0159et\u011Bzec: mus\xED odpov\xEDdat vzoru ${_issue.pattern}`;
          return `Neplatn\xFD form\xE1t ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `Neplatn\xE9 \u010D\xEDslo: mus\xED b\xFDt n\xE1sobkem ${issue2.divisor}`;
        case "unrecognized_keys":
          return `Nezn\xE1m\xE9 kl\xED\u010De: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Neplatn\xFD kl\xED\u010D v ${issue2.origin}`;
        case "invalid_union":
          return "Neplatn\xFD vstup";
        case "invalid_element":
          return `Neplatn\xE1 hodnota v ${issue2.origin}`;
        default:
          return `Neplatn\xFD vstup`;
      }
    };
  };
  function cs_default() {
    return {
      localeError: error6()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/da.js
  var error7 = () => {
    const Sizable = {
      string: { unit: "tegn", verb: "havde" },
      file: { unit: "bytes", verb: "havde" },
      array: { unit: "elementer", verb: "indeholdt" },
      set: { unit: "elementer", verb: "indeholdt" }
    };
    const TypeNames = {
      string: "streng",
      number: "tal",
      boolean: "boolean",
      array: "liste",
      object: "objekt",
      set: "s\xE6t",
      file: "fil"
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    function getTypeName(type) {
      return TypeNames[type] ?? type;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "tal";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "liste";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
          return "objekt";
        }
      }
      return t;
    };
    const Nouns = {
      regex: "input",
      email: "e-mailadresse",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO dato- og klokkesl\xE6t",
      date: "ISO-dato",
      time: "ISO-klokkesl\xE6t",
      duration: "ISO-varighed",
      ipv4: "IPv4-omr\xE5de",
      ipv6: "IPv6-omr\xE5de",
      cidrv4: "IPv4-spektrum",
      cidrv6: "IPv6-spektrum",
      base64: "base64-kodet streng",
      base64url: "base64url-kodet streng",
      json_string: "JSON-streng",
      e164: "E.164-nummer",
      jwt: "JWT",
      template_literal: "input"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Ugyldigt input: forventede ${getTypeName(issue2.expected)}, fik ${getTypeName(parsedType8(issue2.input))}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Ugyldig v\xE6rdi: forventede ${stringifyPrimitive(issue2.values[0])}`;
          return `Ugyldigt valg: forventede en af f\xF8lgende ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          const origin = getTypeName(issue2.origin);
          if (sizing)
            return `For stor: forventede ${origin ?? "value"} ${sizing.verb} ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "elementer"}`;
          return `For stor: forventede ${origin ?? "value"} havde ${adj} ${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          const origin = getTypeName(issue2.origin);
          if (sizing) {
            return `For lille: forventede ${origin} ${sizing.verb} ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `For lille: forventede ${origin} havde ${adj} ${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `Ugyldig streng: skal starte med "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `Ugyldig streng: skal ende med "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Ugyldig streng: skal indeholde "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Ugyldig streng: skal matche m\xF8nsteret ${_issue.pattern}`;
          return `Ugyldig ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `Ugyldigt tal: skal v\xE6re deleligt med ${issue2.divisor}`;
        case "unrecognized_keys":
          return `${issue2.keys.length > 1 ? "Ukendte n\xF8gler" : "Ukendt n\xF8gle"}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Ugyldig n\xF8gle i ${issue2.origin}`;
        case "invalid_union":
          return "Ugyldigt input: matcher ingen af de tilladte typer";
        case "invalid_element":
          return `Ugyldig v\xE6rdi i ${issue2.origin}`;
        default:
          return `Ugyldigt input`;
      }
    };
  };
  function da_default() {
    return {
      localeError: error7()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/de.js
  var error8 = () => {
    const Sizable = {
      string: { unit: "Zeichen", verb: "zu haben" },
      file: { unit: "Bytes", verb: "zu haben" },
      array: { unit: "Elemente", verb: "zu haben" },
      set: { unit: "Elemente", verb: "zu haben" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "Zahl";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "Array";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "Eingabe",
      email: "E-Mail-Adresse",
      url: "URL",
      emoji: "Emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO-Datum und -Uhrzeit",
      date: "ISO-Datum",
      time: "ISO-Uhrzeit",
      duration: "ISO-Dauer",
      ipv4: "IPv4-Adresse",
      ipv6: "IPv6-Adresse",
      cidrv4: "IPv4-Bereich",
      cidrv6: "IPv6-Bereich",
      base64: "Base64-codierter String",
      base64url: "Base64-URL-codierter String",
      json_string: "JSON-String",
      e164: "E.164-Nummer",
      jwt: "JWT",
      template_literal: "Eingabe"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Ung\xFCltige Eingabe: erwartet ${issue2.expected}, erhalten ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Ung\xFCltige Eingabe: erwartet ${stringifyPrimitive(issue2.values[0])}`;
          return `Ung\xFCltige Option: erwartet eine von ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `Zu gro\xDF: erwartet, dass ${issue2.origin ?? "Wert"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "Elemente"} hat`;
          return `Zu gro\xDF: erwartet, dass ${issue2.origin ?? "Wert"} ${adj}${issue2.maximum.toString()} ist`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Zu klein: erwartet, dass ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit} hat`;
          }
          return `Zu klein: erwartet, dass ${issue2.origin} ${adj}${issue2.minimum.toString()} ist`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `Ung\xFCltiger String: muss mit "${_issue.prefix}" beginnen`;
          if (_issue.format === "ends_with")
            return `Ung\xFCltiger String: muss mit "${_issue.suffix}" enden`;
          if (_issue.format === "includes")
            return `Ung\xFCltiger String: muss "${_issue.includes}" enthalten`;
          if (_issue.format === "regex")
            return `Ung\xFCltiger String: muss dem Muster ${_issue.pattern} entsprechen`;
          return `Ung\xFCltig: ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `Ung\xFCltige Zahl: muss ein Vielfaches von ${issue2.divisor} sein`;
        case "unrecognized_keys":
          return `${issue2.keys.length > 1 ? "Unbekannte Schl\xFCssel" : "Unbekannter Schl\xFCssel"}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Ung\xFCltiger Schl\xFCssel in ${issue2.origin}`;
        case "invalid_union":
          return "Ung\xFCltige Eingabe";
        case "invalid_element":
          return `Ung\xFCltiger Wert in ${issue2.origin}`;
        default:
          return `Ung\xFCltige Eingabe`;
      }
    };
  };
  function de_default() {
    return {
      localeError: error8()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/en.js
  var parsedType2 = (data) => {
    const t = typeof data;
    switch (t) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "number";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "array";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t;
  };
  var error9 = () => {
    const Sizable = {
      string: { unit: "characters", verb: "to have" },
      file: { unit: "bytes", verb: "to have" },
      array: { unit: "items", verb: "to have" },
      set: { unit: "items", verb: "to have" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const Nouns = {
      regex: "input",
      email: "email address",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO datetime",
      date: "ISO date",
      time: "ISO time",
      duration: "ISO duration",
      ipv4: "IPv4 address",
      ipv6: "IPv6 address",
      mac: "MAC address",
      cidrv4: "IPv4 range",
      cidrv6: "IPv6 range",
      base64: "base64-encoded string",
      base64url: "base64url-encoded string",
      json_string: "JSON string",
      e164: "E.164 number",
      jwt: "JWT",
      template_literal: "input"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Invalid input: expected ${issue2.expected}, received ${parsedType2(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Invalid input: expected ${stringifyPrimitive(issue2.values[0])}`;
          return `Invalid option: expected one of ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `Too big: expected ${issue2.origin ?? "value"} to have ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elements"}`;
          return `Too big: expected ${issue2.origin ?? "value"} to be ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Too small: expected ${issue2.origin} to have ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `Too small: expected ${issue2.origin} to be ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `Invalid string: must start with "${_issue.prefix}"`;
          }
          if (_issue.format === "ends_with")
            return `Invalid string: must end with "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Invalid string: must include "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Invalid string: must match pattern ${_issue.pattern}`;
          return `Invalid ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `Invalid number: must be a multiple of ${issue2.divisor}`;
        case "unrecognized_keys":
          return `Unrecognized key${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Invalid key in ${issue2.origin}`;
        case "invalid_union":
          return "Invalid input";
        case "invalid_element":
          return `Invalid value in ${issue2.origin}`;
        default:
          return `Invalid input`;
      }
    };
  };
  function en_default() {
    return {
      localeError: error9()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/eo.js
  var parsedType3 = (data) => {
    const t = typeof data;
    switch (t) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "nombro";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "tabelo";
        }
        if (data === null) {
          return "senvalora";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t;
  };
  var error10 = () => {
    const Sizable = {
      string: { unit: "karaktrojn", verb: "havi" },
      file: { unit: "bajtojn", verb: "havi" },
      array: { unit: "elementojn", verb: "havi" },
      set: { unit: "elementojn", verb: "havi" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const Nouns = {
      regex: "enigo",
      email: "retadreso",
      url: "URL",
      emoji: "emo\u011Dio",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO-datotempo",
      date: "ISO-dato",
      time: "ISO-tempo",
      duration: "ISO-da\u016Dro",
      ipv4: "IPv4-adreso",
      ipv6: "IPv6-adreso",
      cidrv4: "IPv4-rango",
      cidrv6: "IPv6-rango",
      base64: "64-ume kodita karaktraro",
      base64url: "URL-64-ume kodita karaktraro",
      json_string: "JSON-karaktraro",
      e164: "E.164-nombro",
      jwt: "JWT",
      template_literal: "enigo"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Nevalida enigo: atendi\u011Dis ${issue2.expected}, ricevi\u011Dis ${parsedType3(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Nevalida enigo: atendi\u011Dis ${stringifyPrimitive(issue2.values[0])}`;
          return `Nevalida opcio: atendi\u011Dis unu el ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `Tro granda: atendi\u011Dis ke ${issue2.origin ?? "valoro"} havu ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementojn"}`;
          return `Tro granda: atendi\u011Dis ke ${issue2.origin ?? "valoro"} havu ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Tro malgranda: atendi\u011Dis ke ${issue2.origin} havu ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `Tro malgranda: atendi\u011Dis ke ${issue2.origin} estu ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `Nevalida karaktraro: devas komenci\u011Di per "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `Nevalida karaktraro: devas fini\u011Di per "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Nevalida karaktraro: devas inkluzivi "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Nevalida karaktraro: devas kongrui kun la modelo ${_issue.pattern}`;
          return `Nevalida ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `Nevalida nombro: devas esti oblo de ${issue2.divisor}`;
        case "unrecognized_keys":
          return `Nekonata${issue2.keys.length > 1 ? "j" : ""} \u015Dlosilo${issue2.keys.length > 1 ? "j" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Nevalida \u015Dlosilo en ${issue2.origin}`;
        case "invalid_union":
          return "Nevalida enigo";
        case "invalid_element":
          return `Nevalida valoro en ${issue2.origin}`;
        default:
          return `Nevalida enigo`;
      }
    };
  };
  function eo_default() {
    return {
      localeError: error10()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/es.js
  var error11 = () => {
    const Sizable = {
      string: { unit: "caracteres", verb: "tener" },
      file: { unit: "bytes", verb: "tener" },
      array: { unit: "elementos", verb: "tener" },
      set: { unit: "elementos", verb: "tener" }
    };
    const TypeNames = {
      string: "texto",
      number: "n\xFAmero",
      boolean: "booleano",
      array: "arreglo",
      object: "objeto",
      set: "conjunto",
      file: "archivo",
      date: "fecha",
      bigint: "n\xFAmero grande",
      symbol: "s\xEDmbolo",
      undefined: "indefinido",
      null: "nulo",
      function: "funci\xF3n",
      map: "mapa",
      record: "registro",
      tuple: "tupla",
      enum: "enumeraci\xF3n",
      union: "uni\xF3n",
      literal: "literal",
      promise: "promesa",
      void: "vac\xEDo",
      never: "nunca",
      unknown: "desconocido",
      any: "cualquiera"
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    function getTypeName(type) {
      return TypeNames[type] ?? type;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "number";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "array";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype) {
            return data.constructor.name;
          }
          return "object";
        }
      }
      return t;
    };
    const Nouns = {
      regex: "entrada",
      email: "direcci\xF3n de correo electr\xF3nico",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "fecha y hora ISO",
      date: "fecha ISO",
      time: "hora ISO",
      duration: "duraci\xF3n ISO",
      ipv4: "direcci\xF3n IPv4",
      ipv6: "direcci\xF3n IPv6",
      cidrv4: "rango IPv4",
      cidrv6: "rango IPv6",
      base64: "cadena codificada en base64",
      base64url: "URL codificada en base64",
      json_string: "cadena JSON",
      e164: "n\xFAmero E.164",
      jwt: "JWT",
      template_literal: "entrada"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Entrada inv\xE1lida: se esperaba ${getTypeName(issue2.expected)}, recibido ${getTypeName(parsedType8(issue2.input))}`;
        // return `Entrada inválida: se esperaba ${issue.expected}, recibido ${util.getParsedType(issue.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Entrada inv\xE1lida: se esperaba ${stringifyPrimitive(issue2.values[0])}`;
          return `Opci\xF3n inv\xE1lida: se esperaba una de ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          const origin = getTypeName(issue2.origin);
          if (sizing)
            return `Demasiado grande: se esperaba que ${origin ?? "valor"} tuviera ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementos"}`;
          return `Demasiado grande: se esperaba que ${origin ?? "valor"} fuera ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          const origin = getTypeName(issue2.origin);
          if (sizing) {
            return `Demasiado peque\xF1o: se esperaba que ${origin} tuviera ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `Demasiado peque\xF1o: se esperaba que ${origin} fuera ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `Cadena inv\xE1lida: debe comenzar con "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `Cadena inv\xE1lida: debe terminar en "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Cadena inv\xE1lida: debe incluir "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Cadena inv\xE1lida: debe coincidir con el patr\xF3n ${_issue.pattern}`;
          return `Inv\xE1lido ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `N\xFAmero inv\xE1lido: debe ser m\xFAltiplo de ${issue2.divisor}`;
        case "unrecognized_keys":
          return `Llave${issue2.keys.length > 1 ? "s" : ""} desconocida${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Llave inv\xE1lida en ${getTypeName(issue2.origin)}`;
        case "invalid_union":
          return "Entrada inv\xE1lida";
        case "invalid_element":
          return `Valor inv\xE1lido en ${getTypeName(issue2.origin)}`;
        default:
          return `Entrada inv\xE1lida`;
      }
    };
  };
  function es_default() {
    return {
      localeError: error11()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/fa.js
  var error12 = () => {
    const Sizable = {
      string: { unit: "\u06A9\u0627\u0631\u0627\u06A9\u062A\u0631", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" },
      file: { unit: "\u0628\u0627\u06CC\u062A", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" },
      array: { unit: "\u0622\u06CC\u062A\u0645", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" },
      set: { unit: "\u0622\u06CC\u062A\u0645", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "\u0639\u062F\u062F";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "\u0622\u0631\u0627\u06CC\u0647";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u0648\u0631\u0648\u062F\u06CC",
      email: "\u0622\u062F\u0631\u0633 \u0627\u06CC\u0645\u06CC\u0644",
      url: "URL",
      emoji: "\u0627\u06CC\u0645\u0648\u062C\u06CC",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\u062A\u0627\u0631\u06CC\u062E \u0648 \u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
      date: "\u062A\u0627\u0631\u06CC\u062E \u0627\u06CC\u0632\u0648",
      time: "\u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
      duration: "\u0645\u062F\u062A \u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
      ipv4: "IPv4 \u0622\u062F\u0631\u0633",
      ipv6: "IPv6 \u0622\u062F\u0631\u0633",
      cidrv4: "IPv4 \u062F\u0627\u0645\u0646\u0647",
      cidrv6: "IPv6 \u062F\u0627\u0645\u0646\u0647",
      base64: "base64-encoded \u0631\u0634\u062A\u0647",
      base64url: "base64url-encoded \u0631\u0634\u062A\u0647",
      json_string: "JSON \u0631\u0634\u062A\u0647",
      e164: "E.164 \u0639\u062F\u062F",
      jwt: "JWT",
      template_literal: "\u0648\u0631\u0648\u062F\u06CC"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${issue2.expected} \u0645\u06CC\u200C\u0628\u0648\u062F\u060C ${parsedType8(issue2.input)} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`;
        case "invalid_value":
          if (issue2.values.length === 1) {
            return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${stringifyPrimitive(issue2.values[0])} \u0645\u06CC\u200C\u0628\u0648\u062F`;
          }
          return `\u06AF\u0632\u06CC\u0646\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A \u06CC\u06A9\u06CC \u0627\u0632 ${joinValues(issue2.values, "|")} \u0645\u06CC\u200C\u0628\u0648\u062F`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${issue2.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0635\u0631"} \u0628\u0627\u0634\u062F`;
          }
          return `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${issue2.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} \u0628\u0627\u0634\u062F`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} ${sizing.unit} \u0628\u0627\u0634\u062F`;
          }
          return `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} \u0628\u0627\u0634\u062F`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${_issue.prefix}" \u0634\u0631\u0648\u0639 \u0634\u0648\u062F`;
          }
          if (_issue.format === "ends_with") {
            return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${_issue.suffix}" \u062A\u0645\u0627\u0645 \u0634\u0648\u062F`;
          }
          if (_issue.format === "includes") {
            return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0634\u0627\u0645\u0644 "${_issue.includes}" \u0628\u0627\u0634\u062F`;
          }
          if (_issue.format === "regex") {
            return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 \u0627\u0644\u06AF\u0648\u06CC ${_issue.pattern} \u0645\u0637\u0627\u0628\u0642\u062A \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F`;
          }
          return `${Nouns[_issue.format] ?? issue2.format} \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
        }
        case "not_multiple_of":
          return `\u0639\u062F\u062F \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0645\u0636\u0631\u0628 ${issue2.divisor} \u0628\u0627\u0634\u062F`;
        case "unrecognized_keys":
          return `\u06A9\u0644\u06CC\u062F${issue2.keys.length > 1 ? "\u0647\u0627\u06CC" : ""} \u0646\u0627\u0634\u0646\u0627\u0633: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `\u06A9\u0644\u06CC\u062F \u0646\u0627\u0634\u0646\u0627\u0633 \u062F\u0631 ${issue2.origin}`;
        case "invalid_union":
          return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
        case "invalid_element":
          return `\u0645\u0642\u062F\u0627\u0631 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u062F\u0631 ${issue2.origin}`;
        default:
          return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
      }
    };
  };
  function fa_default() {
    return {
      localeError: error12()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/fi.js
  var error13 = () => {
    const Sizable = {
      string: { unit: "merkki\xE4", subject: "merkkijonon" },
      file: { unit: "tavua", subject: "tiedoston" },
      array: { unit: "alkiota", subject: "listan" },
      set: { unit: "alkiota", subject: "joukon" },
      number: { unit: "", subject: "luvun" },
      bigint: { unit: "", subject: "suuren kokonaisluvun" },
      int: { unit: "", subject: "kokonaisluvun" },
      date: { unit: "", subject: "p\xE4iv\xE4m\xE4\xE4r\xE4n" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "number";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "array";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "s\xE4\xE4nn\xF6llinen lauseke",
      email: "s\xE4hk\xF6postiosoite",
      url: "URL-osoite",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO-aikaleima",
      date: "ISO-p\xE4iv\xE4m\xE4\xE4r\xE4",
      time: "ISO-aika",
      duration: "ISO-kesto",
      ipv4: "IPv4-osoite",
      ipv6: "IPv6-osoite",
      cidrv4: "IPv4-alue",
      cidrv6: "IPv6-alue",
      base64: "base64-koodattu merkkijono",
      base64url: "base64url-koodattu merkkijono",
      json_string: "JSON-merkkijono",
      e164: "E.164-luku",
      jwt: "JWT",
      template_literal: "templaattimerkkijono"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Virheellinen tyyppi: odotettiin ${issue2.expected}, oli ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Virheellinen sy\xF6te: t\xE4ytyy olla ${stringifyPrimitive(issue2.values[0])}`;
          return `Virheellinen valinta: t\xE4ytyy olla yksi seuraavista: ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Liian suuri: ${sizing.subject} t\xE4ytyy olla ${adj}${issue2.maximum.toString()} ${sizing.unit}`.trim();
          }
          return `Liian suuri: arvon t\xE4ytyy olla ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Liian pieni: ${sizing.subject} t\xE4ytyy olla ${adj}${issue2.minimum.toString()} ${sizing.unit}`.trim();
          }
          return `Liian pieni: arvon t\xE4ytyy olla ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `Virheellinen sy\xF6te: t\xE4ytyy alkaa "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `Virheellinen sy\xF6te: t\xE4ytyy loppua "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Virheellinen sy\xF6te: t\xE4ytyy sis\xE4lt\xE4\xE4 "${_issue.includes}"`;
          if (_issue.format === "regex") {
            return `Virheellinen sy\xF6te: t\xE4ytyy vastata s\xE4\xE4nn\xF6llist\xE4 lauseketta ${_issue.pattern}`;
          }
          return `Virheellinen ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `Virheellinen luku: t\xE4ytyy olla luvun ${issue2.divisor} monikerta`;
        case "unrecognized_keys":
          return `${issue2.keys.length > 1 ? "Tuntemattomat avaimet" : "Tuntematon avain"}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return "Virheellinen avain tietueessa";
        case "invalid_union":
          return "Virheellinen unioni";
        case "invalid_element":
          return "Virheellinen arvo joukossa";
        default:
          return `Virheellinen sy\xF6te`;
      }
    };
  };
  function fi_default() {
    return {
      localeError: error13()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/fr.js
  var error14 = () => {
    const Sizable = {
      string: { unit: "caract\xE8res", verb: "avoir" },
      file: { unit: "octets", verb: "avoir" },
      array: { unit: "\xE9l\xE9ments", verb: "avoir" },
      set: { unit: "\xE9l\xE9ments", verb: "avoir" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "nombre";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "tableau";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "entr\xE9e",
      email: "adresse e-mail",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "date et heure ISO",
      date: "date ISO",
      time: "heure ISO",
      duration: "dur\xE9e ISO",
      ipv4: "adresse IPv4",
      ipv6: "adresse IPv6",
      cidrv4: "plage IPv4",
      cidrv6: "plage IPv6",
      base64: "cha\xEEne encod\xE9e en base64",
      base64url: "cha\xEEne encod\xE9e en base64url",
      json_string: "cha\xEEne JSON",
      e164: "num\xE9ro E.164",
      jwt: "JWT",
      template_literal: "entr\xE9e"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Entr\xE9e invalide : ${issue2.expected} attendu, ${parsedType8(issue2.input)} re\xE7u`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Entr\xE9e invalide : ${stringifyPrimitive(issue2.values[0])} attendu`;
          return `Option invalide : une valeur parmi ${joinValues(issue2.values, "|")} attendue`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `Trop grand : ${issue2.origin ?? "valeur"} doit ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\xE9l\xE9ment(s)"}`;
          return `Trop grand : ${issue2.origin ?? "valeur"} doit \xEAtre ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Trop petit : ${issue2.origin} doit ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `Trop petit : ${issue2.origin} doit \xEAtre ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `Cha\xEEne invalide : doit commencer par "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `Cha\xEEne invalide : doit se terminer par "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Cha\xEEne invalide : doit inclure "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Cha\xEEne invalide : doit correspondre au mod\xE8le ${_issue.pattern}`;
          return `${Nouns[_issue.format] ?? issue2.format} invalide`;
        }
        case "not_multiple_of":
          return `Nombre invalide : doit \xEAtre un multiple de ${issue2.divisor}`;
        case "unrecognized_keys":
          return `Cl\xE9${issue2.keys.length > 1 ? "s" : ""} non reconnue${issue2.keys.length > 1 ? "s" : ""} : ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Cl\xE9 invalide dans ${issue2.origin}`;
        case "invalid_union":
          return "Entr\xE9e invalide";
        case "invalid_element":
          return `Valeur invalide dans ${issue2.origin}`;
        default:
          return `Entr\xE9e invalide`;
      }
    };
  };
  function fr_default() {
    return {
      localeError: error14()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/fr-CA.js
  var error15 = () => {
    const Sizable = {
      string: { unit: "caract\xE8res", verb: "avoir" },
      file: { unit: "octets", verb: "avoir" },
      array: { unit: "\xE9l\xE9ments", verb: "avoir" },
      set: { unit: "\xE9l\xE9ments", verb: "avoir" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "number";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "array";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "entr\xE9e",
      email: "adresse courriel",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "date-heure ISO",
      date: "date ISO",
      time: "heure ISO",
      duration: "dur\xE9e ISO",
      ipv4: "adresse IPv4",
      ipv6: "adresse IPv6",
      cidrv4: "plage IPv4",
      cidrv6: "plage IPv6",
      base64: "cha\xEEne encod\xE9e en base64",
      base64url: "cha\xEEne encod\xE9e en base64url",
      json_string: "cha\xEEne JSON",
      e164: "num\xE9ro E.164",
      jwt: "JWT",
      template_literal: "entr\xE9e"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Entr\xE9e invalide : attendu ${issue2.expected}, re\xE7u ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Entr\xE9e invalide : attendu ${stringifyPrimitive(issue2.values[0])}`;
          return `Option invalide : attendu l'une des valeurs suivantes ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "\u2264" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `Trop grand : attendu que ${issue2.origin ?? "la valeur"} ait ${adj}${issue2.maximum.toString()} ${sizing.unit}`;
          return `Trop grand : attendu que ${issue2.origin ?? "la valeur"} soit ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? "\u2265" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Trop petit : attendu que ${issue2.origin} ait ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `Trop petit : attendu que ${issue2.origin} soit ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `Cha\xEEne invalide : doit commencer par "${_issue.prefix}"`;
          }
          if (_issue.format === "ends_with")
            return `Cha\xEEne invalide : doit se terminer par "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Cha\xEEne invalide : doit inclure "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Cha\xEEne invalide : doit correspondre au motif ${_issue.pattern}`;
          return `${Nouns[_issue.format] ?? issue2.format} invalide`;
        }
        case "not_multiple_of":
          return `Nombre invalide : doit \xEAtre un multiple de ${issue2.divisor}`;
        case "unrecognized_keys":
          return `Cl\xE9${issue2.keys.length > 1 ? "s" : ""} non reconnue${issue2.keys.length > 1 ? "s" : ""} : ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Cl\xE9 invalide dans ${issue2.origin}`;
        case "invalid_union":
          return "Entr\xE9e invalide";
        case "invalid_element":
          return `Valeur invalide dans ${issue2.origin}`;
        default:
          return `Entr\xE9e invalide`;
      }
    };
  };
  function fr_CA_default() {
    return {
      localeError: error15()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/he.js
  var error16 = () => {
    const TypeNames = {
      string: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA", gender: "f" },
      number: { label: "\u05DE\u05E1\u05E4\u05E8", gender: "m" },
      boolean: { label: "\u05E2\u05E8\u05DA \u05D1\u05D5\u05DC\u05D9\u05D0\u05E0\u05D9", gender: "m" },
      bigint: { label: "BigInt", gender: "m" },
      date: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA", gender: "m" },
      array: { label: "\u05DE\u05E2\u05E8\u05DA", gender: "m" },
      object: { label: "\u05D0\u05D5\u05D1\u05D9\u05D9\u05E7\u05D8", gender: "m" },
      null: { label: "\u05E2\u05E8\u05DA \u05E8\u05D9\u05E7 (null)", gender: "m" },
      undefined: { label: "\u05E2\u05E8\u05DA \u05DC\u05D0 \u05DE\u05D5\u05D2\u05D3\u05E8 (undefined)", gender: "m" },
      symbol: { label: "\u05E1\u05D9\u05DE\u05D1\u05D5\u05DC (Symbol)", gender: "m" },
      function: { label: "\u05E4\u05D5\u05E0\u05E7\u05E6\u05D9\u05D4", gender: "f" },
      map: { label: "\u05DE\u05E4\u05D4 (Map)", gender: "f" },
      set: { label: "\u05E7\u05D1\u05D5\u05E6\u05D4 (Set)", gender: "f" },
      file: { label: "\u05E7\u05D5\u05D1\u05E5", gender: "m" },
      promise: { label: "Promise", gender: "m" },
      NaN: { label: "NaN", gender: "m" },
      unknown: { label: "\u05E2\u05E8\u05DA \u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2", gender: "m" },
      value: { label: "\u05E2\u05E8\u05DA", gender: "m" }
    };
    const Sizable = {
      string: { unit: "\u05EA\u05D5\u05D5\u05D9\u05DD", shortLabel: "\u05E7\u05E6\u05E8", longLabel: "\u05D0\u05E8\u05D5\u05DA" },
      file: { unit: "\u05D1\u05D9\u05D9\u05D8\u05D9\u05DD", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" },
      array: { unit: "\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" },
      set: { unit: "\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" },
      number: { unit: "", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" }
      // no unit
    };
    const typeEntry = (t) => t ? TypeNames[t] : void 0;
    const typeLabel = (t) => {
      const e = typeEntry(t);
      if (e)
        return e.label;
      return t ?? TypeNames.unknown.label;
    };
    const withDefinite = (t) => `\u05D4${typeLabel(t)}`;
    const verbFor = (t) => {
      const e = typeEntry(t);
      const gender = e?.gender ?? "m";
      return gender === "f" ? "\u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05D9\u05D5\u05EA" : "\u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA";
    };
    const getSizing = (origin) => {
      if (!origin)
        return null;
      return Sizable[origin] ?? null;
    };
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number":
          return Number.isNaN(data) ? "NaN" : "number";
        case "object": {
          if (Array.isArray(data))
            return "array";
          if (data === null)
            return "null";
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
          return "object";
        }
        default:
          return t;
      }
    };
    const Nouns = {
      regex: { label: "\u05E7\u05DC\u05D8", gender: "m" },
      email: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA \u05D0\u05D9\u05DE\u05D9\u05D9\u05DC", gender: "f" },
      url: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA \u05E8\u05E9\u05EA", gender: "f" },
      emoji: { label: "\u05D0\u05D9\u05DE\u05D5\u05D2'\u05D9", gender: "m" },
      uuid: { label: "UUID", gender: "m" },
      nanoid: { label: "nanoid", gender: "m" },
      guid: { label: "GUID", gender: "m" },
      cuid: { label: "cuid", gender: "m" },
      cuid2: { label: "cuid2", gender: "m" },
      ulid: { label: "ULID", gender: "m" },
      xid: { label: "XID", gender: "m" },
      ksuid: { label: "KSUID", gender: "m" },
      datetime: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA \u05D5\u05D6\u05DE\u05DF ISO", gender: "m" },
      date: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA ISO", gender: "m" },
      time: { label: "\u05D6\u05DE\u05DF ISO", gender: "m" },
      duration: { label: "\u05DE\u05E9\u05DA \u05D6\u05DE\u05DF ISO", gender: "m" },
      ipv4: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA IPv4", gender: "f" },
      ipv6: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA IPv6", gender: "f" },
      cidrv4: { label: "\u05D8\u05D5\u05D5\u05D7 IPv4", gender: "m" },
      cidrv6: { label: "\u05D8\u05D5\u05D5\u05D7 IPv6", gender: "m" },
      base64: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D1\u05D1\u05E1\u05D9\u05E1 64", gender: "f" },
      base64url: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D1\u05D1\u05E1\u05D9\u05E1 64 \u05DC\u05DB\u05EA\u05D5\u05D1\u05D5\u05EA \u05E8\u05E9\u05EA", gender: "f" },
      json_string: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA JSON", gender: "f" },
      e164: { label: "\u05DE\u05E1\u05E4\u05E8 E.164", gender: "m" },
      jwt: { label: "JWT", gender: "m" },
      ends_with: { label: "\u05E7\u05DC\u05D8", gender: "m" },
      includes: { label: "\u05E7\u05DC\u05D8", gender: "m" },
      lowercase: { label: "\u05E7\u05DC\u05D8", gender: "m" },
      starts_with: { label: "\u05E7\u05DC\u05D8", gender: "m" },
      uppercase: { label: "\u05E7\u05DC\u05D8", gender: "m" }
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type": {
          const expectedKey = issue2.expected;
          const expected = typeLabel(expectedKey);
          const receivedKey = parsedType8(issue2.input);
          const received = TypeNames[receivedKey]?.label ?? receivedKey;
          return `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${expected}, \u05D4\u05EA\u05E7\u05D1\u05DC ${received}`;
        }
        case "invalid_value": {
          if (issue2.values.length === 1) {
            return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05E2\u05E8\u05DA \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA ${stringifyPrimitive(issue2.values[0])}`;
          }
          const stringified = issue2.values.map((v) => stringifyPrimitive(v));
          if (issue2.values.length === 2) {
            return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${stringified[0]} \u05D0\u05D5 ${stringified[1]}`;
          }
          const lastValue = stringified[stringified.length - 1];
          const restValues = stringified.slice(0, -1).join(", ");
          return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${restValues} \u05D0\u05D5 ${lastValue}`;
        }
        case "too_big": {
          const sizing = getSizing(issue2.origin);
          const subject = withDefinite(issue2.origin ?? "value");
          if (issue2.origin === "string") {
            return `${sizing?.longLabel ?? "\u05D0\u05E8\u05D5\u05DA"} \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${issue2.maximum.toString()} ${sizing?.unit ?? ""} ${issue2.inclusive ? "\u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA" : "\u05DC\u05DB\u05DC \u05D4\u05D9\u05D5\u05EA\u05E8"}`.trim();
          }
          if (issue2.origin === "number") {
            const comparison = issue2.inclusive ? `\u05E7\u05D8\u05DF \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${issue2.maximum}` : `\u05E7\u05D8\u05DF \u05DE-${issue2.maximum}`;
            return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${comparison}`;
          }
          if (issue2.origin === "array" || issue2.origin === "set") {
            const verb = issue2.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA";
            const comparison = issue2.inclusive ? `${issue2.maximum} ${sizing?.unit ?? ""} \u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA` : `\u05E4\u05D7\u05D5\u05EA \u05DE-${issue2.maximum} ${sizing?.unit ?? ""}`;
            return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${subject} ${verb} \u05DC\u05D4\u05DB\u05D9\u05DC ${comparison}`.trim();
          }
          const adj = issue2.inclusive ? "<=" : "<";
          const be = verbFor(issue2.origin ?? "value");
          if (sizing?.unit) {
            return `${sizing.longLabel} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.maximum.toString()} ${sizing.unit}`;
          }
          return `${sizing?.longLabel ?? "\u05D2\u05D3\u05D5\u05DC"} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const sizing = getSizing(issue2.origin);
          const subject = withDefinite(issue2.origin ?? "value");
          if (issue2.origin === "string") {
            return `${sizing?.shortLabel ?? "\u05E7\u05E6\u05E8"} \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${issue2.minimum.toString()} ${sizing?.unit ?? ""} ${issue2.inclusive ? "\u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8" : "\u05DC\u05E4\u05D7\u05D5\u05EA"}`.trim();
          }
          if (issue2.origin === "number") {
            const comparison = issue2.inclusive ? `\u05D2\u05D3\u05D5\u05DC \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${issue2.minimum}` : `\u05D2\u05D3\u05D5\u05DC \u05DE-${issue2.minimum}`;
            return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${comparison}`;
          }
          if (issue2.origin === "array" || issue2.origin === "set") {
            const verb = issue2.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA";
            if (issue2.minimum === 1 && issue2.inclusive) {
              const singularPhrase = issue2.origin === "set" ? "\u05DC\u05E4\u05D7\u05D5\u05EA \u05E4\u05E8\u05D9\u05D8 \u05D0\u05D7\u05D3" : "\u05DC\u05E4\u05D7\u05D5\u05EA \u05E4\u05E8\u05D9\u05D8 \u05D0\u05D7\u05D3";
              return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${subject} ${verb} \u05DC\u05D4\u05DB\u05D9\u05DC ${singularPhrase}`;
            }
            const comparison = issue2.inclusive ? `${issue2.minimum} ${sizing?.unit ?? ""} \u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8` : `\u05D9\u05D5\u05EA\u05E8 \u05DE-${issue2.minimum} ${sizing?.unit ?? ""}`;
            return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${subject} ${verb} \u05DC\u05D4\u05DB\u05D9\u05DC ${comparison}`.trim();
          }
          const adj = issue2.inclusive ? ">=" : ">";
          const be = verbFor(issue2.origin ?? "value");
          if (sizing?.unit) {
            return `${sizing.shortLabel} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `${sizing?.shortLabel ?? "\u05E7\u05D8\u05DF"} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D7\u05D9\u05DC \u05D1 "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05E1\u05EA\u05D9\u05D9\u05DD \u05D1 "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05DB\u05DC\u05D5\u05DC "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D0\u05D9\u05DD \u05DC\u05EA\u05D1\u05E0\u05D9\u05EA ${_issue.pattern}`;
          const nounEntry = Nouns[_issue.format];
          const noun = nounEntry?.label ?? _issue.format;
          const gender = nounEntry?.gender ?? "m";
          const adjective = gender === "f" ? "\u05EA\u05E7\u05D9\u05E0\u05D4" : "\u05EA\u05E7\u05D9\u05DF";
          return `${noun} \u05DC\u05D0 ${adjective}`;
        }
        case "not_multiple_of":
          return `\u05DE\u05E1\u05E4\u05E8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA \u05DE\u05DB\u05E4\u05DC\u05D4 \u05E9\u05DC ${issue2.divisor}`;
        case "unrecognized_keys":
          return `\u05DE\u05E4\u05EA\u05D7${issue2.keys.length > 1 ? "\u05D5\u05EA" : ""} \u05DC\u05D0 \u05DE\u05D6\u05D5\u05D4${issue2.keys.length > 1 ? "\u05D9\u05DD" : "\u05D4"}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key": {
          return `\u05E9\u05D3\u05D4 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1\u05D0\u05D5\u05D1\u05D9\u05D9\u05E7\u05D8`;
        }
        case "invalid_union":
          return "\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF";
        case "invalid_element": {
          const place = withDefinite(issue2.origin ?? "array");
          return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1${place}`;
        }
        default:
          return `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF`;
      }
    };
  };
  function he_default() {
    return {
      localeError: error16()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/hu.js
  var error17 = () => {
    const Sizable = {
      string: { unit: "karakter", verb: "legyen" },
      file: { unit: "byte", verb: "legyen" },
      array: { unit: "elem", verb: "legyen" },
      set: { unit: "elem", verb: "legyen" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "sz\xE1m";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "t\xF6mb";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "bemenet",
      email: "email c\xEDm",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO id\u0151b\xE9lyeg",
      date: "ISO d\xE1tum",
      time: "ISO id\u0151",
      duration: "ISO id\u0151intervallum",
      ipv4: "IPv4 c\xEDm",
      ipv6: "IPv6 c\xEDm",
      cidrv4: "IPv4 tartom\xE1ny",
      cidrv6: "IPv6 tartom\xE1ny",
      base64: "base64-k\xF3dolt string",
      base64url: "base64url-k\xF3dolt string",
      json_string: "JSON string",
      e164: "E.164 sz\xE1m",
      jwt: "JWT",
      template_literal: "bemenet"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${issue2.expected}, a kapott \xE9rt\xE9k ${parsedType8(issue2.input)}`;
        // return `Invalid input: expected ${issue.expected}, received ${util.getParsedType(issue.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${stringifyPrimitive(issue2.values[0])}`;
          return `\xC9rv\xE9nytelen opci\xF3: valamelyik \xE9rt\xE9k v\xE1rt ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `T\xFAl nagy: ${issue2.origin ?? "\xE9rt\xE9k"} m\xE9rete t\xFAl nagy ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elem"}`;
          return `T\xFAl nagy: a bemeneti \xE9rt\xE9k ${issue2.origin ?? "\xE9rt\xE9k"} t\xFAl nagy: ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${issue2.origin} m\xE9rete t\xFAl kicsi ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${issue2.origin} t\xFAl kicsi ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `\xC9rv\xE9nytelen string: "${_issue.prefix}" \xE9rt\xE9kkel kell kezd\u0151dnie`;
          if (_issue.format === "ends_with")
            return `\xC9rv\xE9nytelen string: "${_issue.suffix}" \xE9rt\xE9kkel kell v\xE9gz\u0151dnie`;
          if (_issue.format === "includes")
            return `\xC9rv\xE9nytelen string: "${_issue.includes}" \xE9rt\xE9ket kell tartalmaznia`;
          if (_issue.format === "regex")
            return `\xC9rv\xE9nytelen string: ${_issue.pattern} mint\xE1nak kell megfelelnie`;
          return `\xC9rv\xE9nytelen ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `\xC9rv\xE9nytelen sz\xE1m: ${issue2.divisor} t\xF6bbsz\xF6r\xF6s\xE9nek kell lennie`;
        case "unrecognized_keys":
          return `Ismeretlen kulcs${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `\xC9rv\xE9nytelen kulcs ${issue2.origin}`;
        case "invalid_union":
          return "\xC9rv\xE9nytelen bemenet";
        case "invalid_element":
          return `\xC9rv\xE9nytelen \xE9rt\xE9k: ${issue2.origin}`;
        default:
          return `\xC9rv\xE9nytelen bemenet`;
      }
    };
  };
  function hu_default() {
    return {
      localeError: error17()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/id.js
  var error18 = () => {
    const Sizable = {
      string: { unit: "karakter", verb: "memiliki" },
      file: { unit: "byte", verb: "memiliki" },
      array: { unit: "item", verb: "memiliki" },
      set: { unit: "item", verb: "memiliki" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "number";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "array";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "input",
      email: "alamat email",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "tanggal dan waktu format ISO",
      date: "tanggal format ISO",
      time: "jam format ISO",
      duration: "durasi format ISO",
      ipv4: "alamat IPv4",
      ipv6: "alamat IPv6",
      cidrv4: "rentang alamat IPv4",
      cidrv6: "rentang alamat IPv6",
      base64: "string dengan enkode base64",
      base64url: "string dengan enkode base64url",
      json_string: "string JSON",
      e164: "angka E.164",
      jwt: "JWT",
      template_literal: "input"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Input tidak valid: diharapkan ${issue2.expected}, diterima ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Input tidak valid: diharapkan ${stringifyPrimitive(issue2.values[0])}`;
          return `Pilihan tidak valid: diharapkan salah satu dari ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `Terlalu besar: diharapkan ${issue2.origin ?? "value"} memiliki ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elemen"}`;
          return `Terlalu besar: diharapkan ${issue2.origin ?? "value"} menjadi ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Terlalu kecil: diharapkan ${issue2.origin} memiliki ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `Terlalu kecil: diharapkan ${issue2.origin} menjadi ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `String tidak valid: harus dimulai dengan "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `String tidak valid: harus berakhir dengan "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `String tidak valid: harus menyertakan "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `String tidak valid: harus sesuai pola ${_issue.pattern}`;
          return `${Nouns[_issue.format] ?? issue2.format} tidak valid`;
        }
        case "not_multiple_of":
          return `Angka tidak valid: harus kelipatan dari ${issue2.divisor}`;
        case "unrecognized_keys":
          return `Kunci tidak dikenali ${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Kunci tidak valid di ${issue2.origin}`;
        case "invalid_union":
          return "Input tidak valid";
        case "invalid_element":
          return `Nilai tidak valid di ${issue2.origin}`;
        default:
          return `Input tidak valid`;
      }
    };
  };
  function id_default() {
    return {
      localeError: error18()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/is.js
  var parsedType4 = (data) => {
    const t = typeof data;
    switch (t) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "n\xFAmer";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "fylki";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t;
  };
  var error19 = () => {
    const Sizable = {
      string: { unit: "stafi", verb: "a\xF0 hafa" },
      file: { unit: "b\xE6ti", verb: "a\xF0 hafa" },
      array: { unit: "hluti", verb: "a\xF0 hafa" },
      set: { unit: "hluti", verb: "a\xF0 hafa" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const Nouns = {
      regex: "gildi",
      email: "netfang",
      url: "vefsl\xF3\xF0",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO dagsetning og t\xEDmi",
      date: "ISO dagsetning",
      time: "ISO t\xEDmi",
      duration: "ISO t\xEDmalengd",
      ipv4: "IPv4 address",
      ipv6: "IPv6 address",
      cidrv4: "IPv4 range",
      cidrv6: "IPv6 range",
      base64: "base64-encoded strengur",
      base64url: "base64url-encoded strengur",
      json_string: "JSON strengur",
      e164: "E.164 t\xF6lugildi",
      jwt: "JWT",
      template_literal: "gildi"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Rangt gildi: \xDE\xFA sl\xF3st inn ${parsedType4(issue2.input)} \xFEar sem \xE1 a\xF0 vera ${issue2.expected}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Rangt gildi: gert r\xE1\xF0 fyrir ${stringifyPrimitive(issue2.values[0])}`;
          return `\xD3gilt val: m\xE1 vera eitt af eftirfarandi ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin ?? "gildi"} hafi ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "hluti"}`;
          return `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin ?? "gildi"} s\xE9 ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin} hafi ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin} s\xE9 ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `\xD3gildur strengur: ver\xF0ur a\xF0 byrja \xE1 "${_issue.prefix}"`;
          }
          if (_issue.format === "ends_with")
            return `\xD3gildur strengur: ver\xF0ur a\xF0 enda \xE1 "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `\xD3gildur strengur: ver\xF0ur a\xF0 innihalda "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `\xD3gildur strengur: ver\xF0ur a\xF0 fylgja mynstri ${_issue.pattern}`;
          return `Rangt ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `R\xF6ng tala: ver\xF0ur a\xF0 vera margfeldi af ${issue2.divisor}`;
        case "unrecognized_keys":
          return `\xD3\xFEekkt ${issue2.keys.length > 1 ? "ir lyklar" : "ur lykill"}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Rangur lykill \xED ${issue2.origin}`;
        case "invalid_union":
          return "Rangt gildi";
        case "invalid_element":
          return `Rangt gildi \xED ${issue2.origin}`;
        default:
          return `Rangt gildi`;
      }
    };
  };
  function is_default() {
    return {
      localeError: error19()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/it.js
  var error20 = () => {
    const Sizable = {
      string: { unit: "caratteri", verb: "avere" },
      file: { unit: "byte", verb: "avere" },
      array: { unit: "elementi", verb: "avere" },
      set: { unit: "elementi", verb: "avere" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "numero";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "vettore";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "input",
      email: "indirizzo email",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "data e ora ISO",
      date: "data ISO",
      time: "ora ISO",
      duration: "durata ISO",
      ipv4: "indirizzo IPv4",
      ipv6: "indirizzo IPv6",
      cidrv4: "intervallo IPv4",
      cidrv6: "intervallo IPv6",
      base64: "stringa codificata in base64",
      base64url: "URL codificata in base64",
      json_string: "stringa JSON",
      e164: "numero E.164",
      jwt: "JWT",
      template_literal: "input"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Input non valido: atteso ${issue2.expected}, ricevuto ${parsedType8(issue2.input)}`;
        // return `Input non valido: atteso ${issue.expected}, ricevuto ${util.getParsedType(issue.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Input non valido: atteso ${stringifyPrimitive(issue2.values[0])}`;
          return `Opzione non valida: atteso uno tra ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `Troppo grande: ${issue2.origin ?? "valore"} deve avere ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementi"}`;
          return `Troppo grande: ${issue2.origin ?? "valore"} deve essere ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Troppo piccolo: ${issue2.origin} deve avere ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `Troppo piccolo: ${issue2.origin} deve essere ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `Stringa non valida: deve iniziare con "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `Stringa non valida: deve terminare con "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Stringa non valida: deve includere "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Stringa non valida: deve corrispondere al pattern ${_issue.pattern}`;
          return `Invalid ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `Numero non valido: deve essere un multiplo di ${issue2.divisor}`;
        case "unrecognized_keys":
          return `Chiav${issue2.keys.length > 1 ? "i" : "e"} non riconosciut${issue2.keys.length > 1 ? "e" : "a"}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Chiave non valida in ${issue2.origin}`;
        case "invalid_union":
          return "Input non valido";
        case "invalid_element":
          return `Valore non valido in ${issue2.origin}`;
        default:
          return `Input non valido`;
      }
    };
  };
  function it_default() {
    return {
      localeError: error20()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ja.js
  var error21 = () => {
    const Sizable = {
      string: { unit: "\u6587\u5B57", verb: "\u3067\u3042\u308B" },
      file: { unit: "\u30D0\u30A4\u30C8", verb: "\u3067\u3042\u308B" },
      array: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" },
      set: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "\u6570\u5024";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "\u914D\u5217";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u5165\u529B\u5024",
      email: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9",
      url: "URL",
      emoji: "\u7D75\u6587\u5B57",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO\u65E5\u6642",
      date: "ISO\u65E5\u4ED8",
      time: "ISO\u6642\u523B",
      duration: "ISO\u671F\u9593",
      ipv4: "IPv4\u30A2\u30C9\u30EC\u30B9",
      ipv6: "IPv6\u30A2\u30C9\u30EC\u30B9",
      cidrv4: "IPv4\u7BC4\u56F2",
      cidrv6: "IPv6\u7BC4\u56F2",
      base64: "base64\u30A8\u30F3\u30B3\u30FC\u30C9\u6587\u5B57\u5217",
      base64url: "base64url\u30A8\u30F3\u30B3\u30FC\u30C9\u6587\u5B57\u5217",
      json_string: "JSON\u6587\u5B57\u5217",
      e164: "E.164\u756A\u53F7",
      jwt: "JWT",
      template_literal: "\u5165\u529B\u5024"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u7121\u52B9\u306A\u5165\u529B: ${issue2.expected}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001${parsedType8(issue2.input)}\u304C\u5165\u529B\u3055\u308C\u307E\u3057\u305F`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\u7121\u52B9\u306A\u5165\u529B: ${stringifyPrimitive(issue2.values[0])}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F`;
          return `\u7121\u52B9\u306A\u9078\u629E: ${joinValues(issue2.values, "\u3001")}\u306E\u3044\u305A\u308C\u304B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        case "too_big": {
          const adj = issue2.inclusive ? "\u4EE5\u4E0B\u3067\u3042\u308B" : "\u3088\u308A\u5C0F\u3055\u3044";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `\u5927\u304D\u3059\u304E\u308B\u5024: ${issue2.origin ?? "\u5024"}\u306F${issue2.maximum.toString()}${sizing.unit ?? "\u8981\u7D20"}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
          return `\u5927\u304D\u3059\u304E\u308B\u5024: ${issue2.origin ?? "\u5024"}\u306F${issue2.maximum.toString()}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? "\u4EE5\u4E0A\u3067\u3042\u308B" : "\u3088\u308A\u5927\u304D\u3044";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${issue2.origin}\u306F${issue2.minimum.toString()}${sizing.unit}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
          return `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${issue2.origin}\u306F${issue2.minimum.toString()}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${_issue.prefix}"\u3067\u59CB\u307E\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
          if (_issue.format === "ends_with")
            return `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${_issue.suffix}"\u3067\u7D42\u308F\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
          if (_issue.format === "includes")
            return `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${_issue.includes}"\u3092\u542B\u3080\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
          if (_issue.format === "regex")
            return `\u7121\u52B9\u306A\u6587\u5B57\u5217: \u30D1\u30BF\u30FC\u30F3${_issue.pattern}\u306B\u4E00\u81F4\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
          return `\u7121\u52B9\u306A${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `\u7121\u52B9\u306A\u6570\u5024: ${issue2.divisor}\u306E\u500D\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        case "unrecognized_keys":
          return `\u8A8D\u8B58\u3055\u308C\u3066\u3044\u306A\u3044\u30AD\u30FC${issue2.keys.length > 1 ? "\u7FA4" : ""}: ${joinValues(issue2.keys, "\u3001")}`;
        case "invalid_key":
          return `${issue2.origin}\u5185\u306E\u7121\u52B9\u306A\u30AD\u30FC`;
        case "invalid_union":
          return "\u7121\u52B9\u306A\u5165\u529B";
        case "invalid_element":
          return `${issue2.origin}\u5185\u306E\u7121\u52B9\u306A\u5024`;
        default:
          return `\u7121\u52B9\u306A\u5165\u529B`;
      }
    };
  };
  function ja_default() {
    return {
      localeError: error21()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ka.js
  var parsedType5 = (data) => {
    const t = typeof data;
    switch (t) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "\u10E0\u10D8\u10EA\u10EE\u10D5\u10D8";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "\u10DB\u10D0\u10E1\u10D8\u10D5\u10D8";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    const typeMap = {
      string: "\u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
      boolean: "\u10D1\u10E3\u10DA\u10D4\u10D0\u10DC\u10D8",
      undefined: "undefined",
      bigint: "bigint",
      symbol: "symbol",
      function: "\u10E4\u10E3\u10DC\u10E5\u10EA\u10D8\u10D0"
    };
    return typeMap[t] ?? t;
  };
  var error22 = () => {
    const Sizable = {
      string: { unit: "\u10E1\u10D8\u10DB\u10D1\u10DD\u10DA\u10DD", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" },
      file: { unit: "\u10D1\u10D0\u10D8\u10E2\u10D8", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" },
      array: { unit: "\u10D4\u10DA\u10D4\u10DB\u10D4\u10DC\u10E2\u10D8", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" },
      set: { unit: "\u10D4\u10DA\u10D4\u10DB\u10D4\u10DC\u10E2\u10D8", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const Nouns = {
      regex: "\u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0",
      email: "\u10D4\u10DA-\u10E4\u10DD\u10E1\u10E2\u10D8\u10E1 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
      url: "URL",
      emoji: "\u10D4\u10DB\u10DD\u10EF\u10D8",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\u10D7\u10D0\u10E0\u10D8\u10E6\u10D8-\u10D3\u10E0\u10DD",
      date: "\u10D7\u10D0\u10E0\u10D8\u10E6\u10D8",
      time: "\u10D3\u10E0\u10DD",
      duration: "\u10EE\u10D0\u10DC\u10D2\u10E0\u10EB\u10DA\u10D8\u10D5\u10DD\u10D1\u10D0",
      ipv4: "IPv4 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
      ipv6: "IPv6 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
      cidrv4: "IPv4 \u10D3\u10D8\u10D0\u10DE\u10D0\u10D6\u10DD\u10DC\u10D8",
      cidrv6: "IPv6 \u10D3\u10D8\u10D0\u10DE\u10D0\u10D6\u10DD\u10DC\u10D8",
      base64: "base64-\u10D9\u10DD\u10D3\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
      base64url: "base64url-\u10D9\u10DD\u10D3\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
      json_string: "JSON \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
      e164: "E.164 \u10DC\u10DD\u10DB\u10D4\u10E0\u10D8",
      jwt: "JWT",
      template_literal: "\u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.expected}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 ${parsedType5(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${stringifyPrimitive(issue2.values[0])}`;
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D5\u10D0\u10E0\u10D8\u10D0\u10DC\u10E2\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8\u10D0 \u10D4\u10E0\u10D7-\u10D4\u10E0\u10D7\u10D8 ${joinValues(issue2.values, "|")}-\u10D3\u10D0\u10DC`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit}`;
          return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} \u10D8\u10E7\u10DD\u10E1 ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin} \u10D8\u10E7\u10DD\u10E1 ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10D8\u10EC\u10E7\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${_issue.prefix}"-\u10D8\u10D7`;
          }
          if (_issue.format === "ends_with")
            return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10DB\u10D7\u10D0\u10D5\u10E0\u10D3\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${_issue.suffix}"-\u10D8\u10D7`;
          if (_issue.format === "includes")
            return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1 "${_issue.includes}"-\u10E1`;
          if (_issue.format === "regex")
            return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D4\u10E1\u10D0\u10D1\u10D0\u10DB\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 \u10E8\u10D0\u10D1\u10DA\u10DD\u10DC\u10E1 ${_issue.pattern}`;
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E0\u10D8\u10EA\u10EE\u10D5\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10D8\u10E7\u10DD\u10E1 ${issue2.divisor}-\u10D8\u10E1 \u10EF\u10D4\u10E0\u10D0\u10D3\u10D8`;
        case "unrecognized_keys":
          return `\u10E3\u10EA\u10DC\u10DD\u10D1\u10D8 \u10D2\u10D0\u10E1\u10D0\u10E6\u10D4\u10D1${issue2.keys.length > 1 ? "\u10D4\u10D1\u10D8" : "\u10D8"}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D2\u10D0\u10E1\u10D0\u10E6\u10D4\u10D1\u10D8 ${issue2.origin}-\u10E8\u10D8`;
        case "invalid_union":
          return "\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0";
        case "invalid_element":
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0 ${issue2.origin}-\u10E8\u10D8`;
        default:
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0`;
      }
    };
  };
  function ka_default() {
    return {
      localeError: error22()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/km.js
  var error23 = () => {
    const Sizable = {
      string: { unit: "\u178F\u17BD\u17A2\u1780\u17D2\u179F\u179A", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
      file: { unit: "\u1794\u17C3", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
      array: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
      set: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "\u1798\u17B7\u1793\u1798\u17C2\u1793\u1787\u17B6\u179B\u17C1\u1781 (NaN)" : "\u179B\u17C1\u1781";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "\u17A2\u17B6\u179A\u17C1 (Array)";
          }
          if (data === null) {
            return "\u1782\u17D2\u1798\u17B6\u1793\u178F\u1798\u17D2\u179B\u17C3 (null)";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B",
      email: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793\u17A2\u17CA\u17B8\u1798\u17C2\u179B",
      url: "URL",
      emoji: "\u179F\u1789\u17D2\u1789\u17B6\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791 \u1793\u17B7\u1784\u1798\u17C9\u17C4\u1784 ISO",
      date: "\u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791 ISO",
      time: "\u1798\u17C9\u17C4\u1784 ISO",
      duration: "\u179A\u1799\u17C8\u1796\u17C1\u179B ISO",
      ipv4: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv4",
      ipv6: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv6",
      cidrv4: "\u178A\u17C2\u1793\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv4",
      cidrv6: "\u178A\u17C2\u1793\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv6",
      base64: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u17A2\u17CA\u17B7\u1780\u17BC\u178A base64",
      base64url: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u17A2\u17CA\u17B7\u1780\u17BC\u178A base64url",
      json_string: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A JSON",
      e164: "\u179B\u17C1\u1781 E.164",
      jwt: "JWT",
      template_literal: "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.expected} \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${stringifyPrimitive(issue2.values[0])}`;
          return `\u1787\u1798\u17D2\u179A\u17BE\u179F\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1787\u17B6\u1798\u17BD\u1799\u1780\u17D2\u1793\u17BB\u1784\u1785\u17C6\u178E\u17C4\u1798 ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "\u1792\u17B6\u178F\u17BB"}`;
          return `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${adj} ${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin} ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin} ${adj} ${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798\u178A\u17C4\u1799 "${_issue.prefix}"`;
          }
          if (_issue.format === "ends_with")
            return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1794\u1789\u17D2\u1785\u1794\u17CB\u178A\u17C4\u1799 "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1798\u17B6\u1793 "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1795\u17D2\u1782\u17BC\u1795\u17D2\u1782\u1784\u1793\u17B9\u1784\u1791\u1798\u17D2\u179A\u1784\u17CB\u178A\u17C2\u179B\u1794\u17B6\u1793\u1780\u17C6\u178E\u178F\u17CB ${_issue.pattern}`;
          return `\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `\u179B\u17C1\u1781\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1787\u17B6\u1796\u17A0\u17BB\u1782\u17BB\u178E\u1793\u17C3 ${issue2.divisor}`;
        case "unrecognized_keys":
          return `\u179A\u1780\u1783\u17BE\u1789\u179F\u17C4\u1798\u17B7\u1793\u179F\u17D2\u1782\u17B6\u179B\u17CB\u17D6 ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `\u179F\u17C4\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${issue2.origin}`;
        case "invalid_union":
          return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C`;
        case "invalid_element":
          return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${issue2.origin}`;
        default:
          return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C`;
      }
    };
  };
  function km_default() {
    return {
      localeError: error23()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/kh.js
  function kh_default() {
    return km_default();
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ko.js
  var error24 = () => {
    const Sizable = {
      string: { unit: "\uBB38\uC790", verb: "to have" },
      file: { unit: "\uBC14\uC774\uD2B8", verb: "to have" },
      array: { unit: "\uAC1C", verb: "to have" },
      set: { unit: "\uAC1C", verb: "to have" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "number";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "array";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\uC785\uB825",
      email: "\uC774\uBA54\uC77C \uC8FC\uC18C",
      url: "URL",
      emoji: "\uC774\uBAA8\uC9C0",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \uB0A0\uC9DC\uC2DC\uAC04",
      date: "ISO \uB0A0\uC9DC",
      time: "ISO \uC2DC\uAC04",
      duration: "ISO \uAE30\uAC04",
      ipv4: "IPv4 \uC8FC\uC18C",
      ipv6: "IPv6 \uC8FC\uC18C",
      cidrv4: "IPv4 \uBC94\uC704",
      cidrv6: "IPv6 \uBC94\uC704",
      base64: "base64 \uC778\uCF54\uB529 \uBB38\uC790\uC5F4",
      base64url: "base64url \uC778\uCF54\uB529 \uBB38\uC790\uC5F4",
      json_string: "JSON \uBB38\uC790\uC5F4",
      e164: "E.164 \uBC88\uD638",
      jwt: "JWT",
      template_literal: "\uC785\uB825"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\uC798\uBABB\uB41C \uC785\uB825: \uC608\uC0C1 \uD0C0\uC785\uC740 ${issue2.expected}, \uBC1B\uC740 \uD0C0\uC785\uC740 ${parsedType8(issue2.input)}\uC785\uB2C8\uB2E4`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\uC798\uBABB\uB41C \uC785\uB825: \uAC12\uC740 ${stringifyPrimitive(issue2.values[0])} \uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4`;
          return `\uC798\uBABB\uB41C \uC635\uC158: ${joinValues(issue2.values, "\uB610\uB294 ")} \uC911 \uD558\uB098\uC5EC\uC57C \uD569\uB2C8\uB2E4`;
        case "too_big": {
          const adj = issue2.inclusive ? "\uC774\uD558" : "\uBBF8\uB9CC";
          const suffix = adj === "\uBBF8\uB9CC" ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4" : "\uC5EC\uC57C \uD569\uB2C8\uB2E4";
          const sizing = getSizing(issue2.origin);
          const unit = sizing?.unit ?? "\uC694\uC18C";
          if (sizing)
            return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${issue2.maximum.toString()}${unit} ${adj}${suffix}`;
          return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${issue2.maximum.toString()} ${adj}${suffix}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? "\uC774\uC0C1" : "\uCD08\uACFC";
          const suffix = adj === "\uC774\uC0C1" ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4" : "\uC5EC\uC57C \uD569\uB2C8\uB2E4";
          const sizing = getSizing(issue2.origin);
          const unit = sizing?.unit ?? "\uC694\uC18C";
          if (sizing) {
            return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${issue2.minimum.toString()}${unit} ${adj}${suffix}`;
          }
          return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${issue2.minimum.toString()} ${adj}${suffix}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${_issue.prefix}"(\uC73C)\uB85C \uC2DC\uC791\uD574\uC57C \uD569\uB2C8\uB2E4`;
          }
          if (_issue.format === "ends_with")
            return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${_issue.suffix}"(\uC73C)\uB85C \uB05D\uB098\uC57C \uD569\uB2C8\uB2E4`;
          if (_issue.format === "includes")
            return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${_issue.includes}"\uC744(\uB97C) \uD3EC\uD568\uD574\uC57C \uD569\uB2C8\uB2E4`;
          if (_issue.format === "regex")
            return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: \uC815\uADDC\uC2DD ${_issue.pattern} \uD328\uD134\uACFC \uC77C\uCE58\uD574\uC57C \uD569\uB2C8\uB2E4`;
          return `\uC798\uBABB\uB41C ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `\uC798\uBABB\uB41C \uC22B\uC790: ${issue2.divisor}\uC758 \uBC30\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4`;
        case "unrecognized_keys":
          return `\uC778\uC2DD\uD560 \uC218 \uC5C6\uB294 \uD0A4: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `\uC798\uBABB\uB41C \uD0A4: ${issue2.origin}`;
        case "invalid_union":
          return `\uC798\uBABB\uB41C \uC785\uB825`;
        case "invalid_element":
          return `\uC798\uBABB\uB41C \uAC12: ${issue2.origin}`;
        default:
          return `\uC798\uBABB\uB41C \uC785\uB825`;
      }
    };
  };
  function ko_default() {
    return {
      localeError: error24()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/lt.js
  var parsedType6 = (data) => {
    const t = typeof data;
    return parsedTypeFromType(t, data);
  };
  var parsedTypeFromType = (t, data = void 0) => {
    switch (t) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "skai\u010Dius";
      }
      case "bigint": {
        return "sveikasis skai\u010Dius";
      }
      case "string": {
        return "eilut\u0117";
      }
      case "boolean": {
        return "login\u0117 reik\u0161m\u0117";
      }
      case "undefined":
      case "void": {
        return "neapibr\u0117\u017Eta reik\u0161m\u0117";
      }
      case "function": {
        return "funkcija";
      }
      case "symbol": {
        return "simbolis";
      }
      case "object": {
        if (data === void 0)
          return "ne\u017Einomas objektas";
        if (data === null)
          return "nulin\u0117 reik\u0161m\u0117";
        if (Array.isArray(data))
          return "masyvas";
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
        return "objektas";
      }
      //Zod types below
      case "null": {
        return "nulin\u0117 reik\u0161m\u0117";
      }
    }
    return t;
  };
  var capitalizeFirstCharacter = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  function getUnitTypeFromNumber(number4) {
    const abs = Math.abs(number4);
    const last = abs % 10;
    const last2 = abs % 100;
    if (last2 >= 11 && last2 <= 19 || last === 0)
      return "many";
    if (last === 1)
      return "one";
    return "few";
  }
  var error25 = () => {
    const Sizable = {
      string: {
        unit: {
          one: "simbolis",
          few: "simboliai",
          many: "simboli\u0173"
        },
        verb: {
          smaller: {
            inclusive: "turi b\u016Bti ne ilgesn\u0117 kaip",
            notInclusive: "turi b\u016Bti trumpesn\u0117 kaip"
          },
          bigger: {
            inclusive: "turi b\u016Bti ne trumpesn\u0117 kaip",
            notInclusive: "turi b\u016Bti ilgesn\u0117 kaip"
          }
        }
      },
      file: {
        unit: {
          one: "baitas",
          few: "baitai",
          many: "bait\u0173"
        },
        verb: {
          smaller: {
            inclusive: "turi b\u016Bti ne didesnis kaip",
            notInclusive: "turi b\u016Bti ma\u017Eesnis kaip"
          },
          bigger: {
            inclusive: "turi b\u016Bti ne ma\u017Eesnis kaip",
            notInclusive: "turi b\u016Bti didesnis kaip"
          }
        }
      },
      array: {
        unit: {
          one: "element\u0105",
          few: "elementus",
          many: "element\u0173"
        },
        verb: {
          smaller: {
            inclusive: "turi tur\u0117ti ne daugiau kaip",
            notInclusive: "turi tur\u0117ti ma\u017Eiau kaip"
          },
          bigger: {
            inclusive: "turi tur\u0117ti ne ma\u017Eiau kaip",
            notInclusive: "turi tur\u0117ti daugiau kaip"
          }
        }
      },
      set: {
        unit: {
          one: "element\u0105",
          few: "elementus",
          many: "element\u0173"
        },
        verb: {
          smaller: {
            inclusive: "turi tur\u0117ti ne daugiau kaip",
            notInclusive: "turi tur\u0117ti ma\u017Eiau kaip"
          },
          bigger: {
            inclusive: "turi tur\u0117ti ne ma\u017Eiau kaip",
            notInclusive: "turi tur\u0117ti daugiau kaip"
          }
        }
      }
    };
    function getSizing(origin, unitType, inclusive, targetShouldBe) {
      const result = Sizable[origin] ?? null;
      if (result === null)
        return result;
      return {
        unit: result.unit[unitType],
        verb: result.verb[targetShouldBe][inclusive ? "inclusive" : "notInclusive"]
      };
    }
    const Nouns = {
      regex: "\u012Fvestis",
      email: "el. pa\u0161to adresas",
      url: "URL",
      emoji: "jaustukas",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO data ir laikas",
      date: "ISO data",
      time: "ISO laikas",
      duration: "ISO trukm\u0117",
      ipv4: "IPv4 adresas",
      ipv6: "IPv6 adresas",
      cidrv4: "IPv4 tinklo prefiksas (CIDR)",
      cidrv6: "IPv6 tinklo prefiksas (CIDR)",
      base64: "base64 u\u017Ekoduota eilut\u0117",
      base64url: "base64url u\u017Ekoduota eilut\u0117",
      json_string: "JSON eilut\u0117",
      e164: "E.164 numeris",
      jwt: "JWT",
      template_literal: "\u012Fvestis"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Gautas tipas ${parsedType6(issue2.input)}, o tik\u0117tasi - ${parsedTypeFromType(issue2.expected)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Privalo b\u016Bti ${stringifyPrimitive(issue2.values[0])}`;
          return `Privalo b\u016Bti vienas i\u0161 ${joinValues(issue2.values, "|")} pasirinkim\u0173`;
        case "too_big": {
          const origin = parsedTypeFromType(issue2.origin);
          const sizing = getSizing(issue2.origin, getUnitTypeFromNumber(Number(issue2.maximum)), issue2.inclusive ?? false, "smaller");
          if (sizing?.verb)
            return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} ${sizing.verb} ${issue2.maximum.toString()} ${sizing.unit ?? "element\u0173"}`;
          const adj = issue2.inclusive ? "ne didesnis kaip" : "ma\u017Eesnis kaip";
          return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${adj} ${issue2.maximum.toString()} ${sizing?.unit}`;
        }
        case "too_small": {
          const origin = parsedTypeFromType(issue2.origin);
          const sizing = getSizing(issue2.origin, getUnitTypeFromNumber(Number(issue2.minimum)), issue2.inclusive ?? false, "bigger");
          if (sizing?.verb)
            return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} ${sizing.verb} ${issue2.minimum.toString()} ${sizing.unit ?? "element\u0173"}`;
          const adj = issue2.inclusive ? "ne ma\u017Eesnis kaip" : "didesnis kaip";
          return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${adj} ${issue2.minimum.toString()} ${sizing?.unit}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `Eilut\u0117 privalo prasid\u0117ti "${_issue.prefix}"`;
          }
          if (_issue.format === "ends_with")
            return `Eilut\u0117 privalo pasibaigti "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Eilut\u0117 privalo \u012Ftraukti "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Eilut\u0117 privalo atitikti ${_issue.pattern}`;
          return `Neteisingas ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `Skai\u010Dius privalo b\u016Bti ${issue2.divisor} kartotinis.`;
        case "unrecognized_keys":
          return `Neatpa\u017Eint${issue2.keys.length > 1 ? "i" : "as"} rakt${issue2.keys.length > 1 ? "ai" : "as"}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return "Rastas klaidingas raktas";
        case "invalid_union":
          return "Klaidinga \u012Fvestis";
        case "invalid_element": {
          const origin = parsedTypeFromType(issue2.origin);
          return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} turi klaiding\u0105 \u012Fvest\u012F`;
        }
        default:
          return "Klaidinga \u012Fvestis";
      }
    };
  };
  function lt_default() {
    return {
      localeError: error25()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/mk.js
  var error26 = () => {
    const Sizable = {
      string: { unit: "\u0437\u043D\u0430\u0446\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
      file: { unit: "\u0431\u0430\u0458\u0442\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
      array: { unit: "\u0441\u0442\u0430\u0432\u043A\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
      set: { unit: "\u0441\u0442\u0430\u0432\u043A\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "\u0431\u0440\u043E\u0458";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "\u043D\u0438\u0437\u0430";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u0432\u043D\u0435\u0441",
      email: "\u0430\u0434\u0440\u0435\u0441\u0430 \u043D\u0430 \u0435-\u043F\u043E\u0448\u0442\u0430",
      url: "URL",
      emoji: "\u0435\u043C\u043E\u045F\u0438",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0434\u0430\u0442\u0443\u043C \u0438 \u0432\u0440\u0435\u043C\u0435",
      date: "ISO \u0434\u0430\u0442\u0443\u043C",
      time: "ISO \u0432\u0440\u0435\u043C\u0435",
      duration: "ISO \u0432\u0440\u0435\u043C\u0435\u0442\u0440\u0430\u0435\u045A\u0435",
      ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441\u0430",
      ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441\u0430",
      cidrv4: "IPv4 \u043E\u043F\u0441\u0435\u0433",
      cidrv6: "IPv6 \u043E\u043F\u0441\u0435\u0433",
      base64: "base64-\u0435\u043D\u043A\u043E\u0434\u0438\u0440\u0430\u043D\u0430 \u043D\u0438\u0437\u0430",
      base64url: "base64url-\u0435\u043D\u043A\u043E\u0434\u0438\u0440\u0430\u043D\u0430 \u043D\u0438\u0437\u0430",
      json_string: "JSON \u043D\u0438\u0437\u0430",
      e164: "E.164 \u0431\u0440\u043E\u0458",
      jwt: "JWT",
      template_literal: "\u0432\u043D\u0435\u0441"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.expected}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E ${parsedType8(issue2.input)}`;
        // return `Invalid input: expected ${issue.expected}, received ${util.getParsedType(issue.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Invalid input: expected ${stringifyPrimitive(issue2.values[0])}`;
          return `\u0413\u0440\u0435\u0448\u0430\u043D\u0430 \u043E\u043F\u0446\u0438\u0458\u0430: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 \u0435\u0434\u043D\u0430 ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0438\u043C\u0430 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0438"}`;
          return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0431\u0438\u0434\u0435 ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin} \u0434\u0430 \u0438\u043C\u0430 ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin} \u0434\u0430 \u0431\u0438\u0434\u0435 ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u043D\u0443\u0432\u0430 \u0441\u043E "${_issue.prefix}"`;
          }
          if (_issue.format === "ends_with")
            return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u0432\u0440\u0448\u0443\u0432\u0430 \u0441\u043E "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0432\u043A\u043B\u0443\u0447\u0443\u0432\u0430 "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u043E\u0434\u0433\u043E\u0430\u0440\u0430 \u043D\u0430 \u043F\u0430\u0442\u0435\u0440\u043D\u043E\u0442 ${_issue.pattern}`;
          return `Invalid ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `\u0413\u0440\u0435\u0448\u0435\u043D \u0431\u0440\u043E\u0458: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0431\u0438\u0434\u0435 \u0434\u0435\u043B\u0438\u0432 \u0441\u043E ${issue2.divisor}`;
        case "unrecognized_keys":
          return `${issue2.keys.length > 1 ? "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D\u0438 \u043A\u043B\u0443\u0447\u0435\u0432\u0438" : "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D \u043A\u043B\u0443\u0447"}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `\u0413\u0440\u0435\u0448\u0435\u043D \u043A\u043B\u0443\u0447 \u0432\u043E ${issue2.origin}`;
        case "invalid_union":
          return "\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441";
        case "invalid_element":
          return `\u0413\u0440\u0435\u0448\u043D\u0430 \u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442 \u0432\u043E ${issue2.origin}`;
        default:
          return `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441`;
      }
    };
  };
  function mk_default() {
    return {
      localeError: error26()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ms.js
  var error27 = () => {
    const Sizable = {
      string: { unit: "aksara", verb: "mempunyai" },
      file: { unit: "bait", verb: "mempunyai" },
      array: { unit: "elemen", verb: "mempunyai" },
      set: { unit: "elemen", verb: "mempunyai" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "nombor";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "array";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "input",
      email: "alamat e-mel",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "tarikh masa ISO",
      date: "tarikh ISO",
      time: "masa ISO",
      duration: "tempoh ISO",
      ipv4: "alamat IPv4",
      ipv6: "alamat IPv6",
      cidrv4: "julat IPv4",
      cidrv6: "julat IPv6",
      base64: "string dikodkan base64",
      base64url: "string dikodkan base64url",
      json_string: "string JSON",
      e164: "nombor E.164",
      jwt: "JWT",
      template_literal: "input"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Input tidak sah: dijangka ${issue2.expected}, diterima ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Input tidak sah: dijangka ${stringifyPrimitive(issue2.values[0])}`;
          return `Pilihan tidak sah: dijangka salah satu daripada ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `Terlalu besar: dijangka ${issue2.origin ?? "nilai"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elemen"}`;
          return `Terlalu besar: dijangka ${issue2.origin ?? "nilai"} adalah ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Terlalu kecil: dijangka ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `Terlalu kecil: dijangka ${issue2.origin} adalah ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `String tidak sah: mesti bermula dengan "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `String tidak sah: mesti berakhir dengan "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `String tidak sah: mesti mengandungi "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `String tidak sah: mesti sepadan dengan corak ${_issue.pattern}`;
          return `${Nouns[_issue.format] ?? issue2.format} tidak sah`;
        }
        case "not_multiple_of":
          return `Nombor tidak sah: perlu gandaan ${issue2.divisor}`;
        case "unrecognized_keys":
          return `Kunci tidak dikenali: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Kunci tidak sah dalam ${issue2.origin}`;
        case "invalid_union":
          return "Input tidak sah";
        case "invalid_element":
          return `Nilai tidak sah dalam ${issue2.origin}`;
        default:
          return `Input tidak sah`;
      }
    };
  };
  function ms_default() {
    return {
      localeError: error27()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/nl.js
  var error28 = () => {
    const Sizable = {
      string: { unit: "tekens", verb: "te hebben" },
      file: { unit: "bytes", verb: "te hebben" },
      array: { unit: "elementen", verb: "te hebben" },
      set: { unit: "elementen", verb: "te hebben" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "getal";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "array";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "invoer",
      email: "emailadres",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO datum en tijd",
      date: "ISO datum",
      time: "ISO tijd",
      duration: "ISO duur",
      ipv4: "IPv4-adres",
      ipv6: "IPv6-adres",
      cidrv4: "IPv4-bereik",
      cidrv6: "IPv6-bereik",
      base64: "base64-gecodeerde tekst",
      base64url: "base64 URL-gecodeerde tekst",
      json_string: "JSON string",
      e164: "E.164-nummer",
      jwt: "JWT",
      template_literal: "invoer"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Ongeldige invoer: verwacht ${issue2.expected}, ontving ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Ongeldige invoer: verwacht ${stringifyPrimitive(issue2.values[0])}`;
          return `Ongeldige optie: verwacht \xE9\xE9n van ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `Te groot: verwacht dat ${issue2.origin ?? "waarde"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementen"}`;
          return `Te groot: verwacht dat ${issue2.origin ?? "waarde"} ${adj}${issue2.maximum.toString()} is`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Te klein: verwacht dat ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `Te klein: verwacht dat ${issue2.origin} ${adj}${issue2.minimum.toString()} is`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `Ongeldige tekst: moet met "${_issue.prefix}" beginnen`;
          }
          if (_issue.format === "ends_with")
            return `Ongeldige tekst: moet op "${_issue.suffix}" eindigen`;
          if (_issue.format === "includes")
            return `Ongeldige tekst: moet "${_issue.includes}" bevatten`;
          if (_issue.format === "regex")
            return `Ongeldige tekst: moet overeenkomen met patroon ${_issue.pattern}`;
          return `Ongeldig: ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `Ongeldig getal: moet een veelvoud van ${issue2.divisor} zijn`;
        case "unrecognized_keys":
          return `Onbekende key${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Ongeldige key in ${issue2.origin}`;
        case "invalid_union":
          return "Ongeldige invoer";
        case "invalid_element":
          return `Ongeldige waarde in ${issue2.origin}`;
        default:
          return `Ongeldige invoer`;
      }
    };
  };
  function nl_default() {
    return {
      localeError: error28()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/no.js
  var error29 = () => {
    const Sizable = {
      string: { unit: "tegn", verb: "\xE5 ha" },
      file: { unit: "bytes", verb: "\xE5 ha" },
      array: { unit: "elementer", verb: "\xE5 inneholde" },
      set: { unit: "elementer", verb: "\xE5 inneholde" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "tall";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "liste";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "input",
      email: "e-postadresse",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO dato- og klokkeslett",
      date: "ISO-dato",
      time: "ISO-klokkeslett",
      duration: "ISO-varighet",
      ipv4: "IPv4-omr\xE5de",
      ipv6: "IPv6-omr\xE5de",
      cidrv4: "IPv4-spekter",
      cidrv6: "IPv6-spekter",
      base64: "base64-enkodet streng",
      base64url: "base64url-enkodet streng",
      json_string: "JSON-streng",
      e164: "E.164-nummer",
      jwt: "JWT",
      template_literal: "input"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Ugyldig input: forventet ${issue2.expected}, fikk ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Ugyldig verdi: forventet ${stringifyPrimitive(issue2.values[0])}`;
          return `Ugyldig valg: forventet en av ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `For stor(t): forventet ${issue2.origin ?? "value"} til \xE5 ha ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementer"}`;
          return `For stor(t): forventet ${issue2.origin ?? "value"} til \xE5 ha ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `For lite(n): forventet ${issue2.origin} til \xE5 ha ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `For lite(n): forventet ${issue2.origin} til \xE5 ha ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `Ugyldig streng: m\xE5 starte med "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `Ugyldig streng: m\xE5 ende med "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Ugyldig streng: m\xE5 inneholde "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Ugyldig streng: m\xE5 matche m\xF8nsteret ${_issue.pattern}`;
          return `Ugyldig ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `Ugyldig tall: m\xE5 v\xE6re et multiplum av ${issue2.divisor}`;
        case "unrecognized_keys":
          return `${issue2.keys.length > 1 ? "Ukjente n\xF8kler" : "Ukjent n\xF8kkel"}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Ugyldig n\xF8kkel i ${issue2.origin}`;
        case "invalid_union":
          return "Ugyldig input";
        case "invalid_element":
          return `Ugyldig verdi i ${issue2.origin}`;
        default:
          return `Ugyldig input`;
      }
    };
  };
  function no_default() {
    return {
      localeError: error29()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ota.js
  var error30 = () => {
    const Sizable = {
      string: { unit: "harf", verb: "olmal\u0131d\u0131r" },
      file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
      array: { unit: "unsur", verb: "olmal\u0131d\u0131r" },
      set: { unit: "unsur", verb: "olmal\u0131d\u0131r" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "numara";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "saf";
          }
          if (data === null) {
            return "gayb";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "giren",
      email: "epostag\xE2h",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO heng\xE2m\u0131",
      date: "ISO tarihi",
      time: "ISO zaman\u0131",
      duration: "ISO m\xFCddeti",
      ipv4: "IPv4 ni\u015F\xE2n\u0131",
      ipv6: "IPv6 ni\u015F\xE2n\u0131",
      cidrv4: "IPv4 menzili",
      cidrv6: "IPv6 menzili",
      base64: "base64-\u015Fifreli metin",
      base64url: "base64url-\u015Fifreli metin",
      json_string: "JSON metin",
      e164: "E.164 say\u0131s\u0131",
      jwt: "JWT",
      template_literal: "giren"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `F\xE2sit giren: umulan ${issue2.expected}, al\u0131nan ${parsedType8(issue2.input)}`;
        // return `Fâsit giren: umulan ${issue.expected}, alınan ${util.getParsedType(issue.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `F\xE2sit giren: umulan ${stringifyPrimitive(issue2.values[0])}`;
          return `F\xE2sit tercih: m\xFBteberler ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `Fazla b\xFCy\xFCk: ${issue2.origin ?? "value"}, ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elements"} sahip olmal\u0131yd\u0131.`;
          return `Fazla b\xFCy\xFCk: ${issue2.origin ?? "value"}, ${adj}${issue2.maximum.toString()} olmal\u0131yd\u0131.`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Fazla k\xFC\xE7\xFCk: ${issue2.origin}, ${adj}${issue2.minimum.toString()} ${sizing.unit} sahip olmal\u0131yd\u0131.`;
          }
          return `Fazla k\xFC\xE7\xFCk: ${issue2.origin}, ${adj}${issue2.minimum.toString()} olmal\u0131yd\u0131.`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `F\xE2sit metin: "${_issue.prefix}" ile ba\u015Flamal\u0131.`;
          if (_issue.format === "ends_with")
            return `F\xE2sit metin: "${_issue.suffix}" ile bitmeli.`;
          if (_issue.format === "includes")
            return `F\xE2sit metin: "${_issue.includes}" ihtiv\xE2 etmeli.`;
          if (_issue.format === "regex")
            return `F\xE2sit metin: ${_issue.pattern} nak\u015F\u0131na uymal\u0131.`;
          return `F\xE2sit ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `F\xE2sit say\u0131: ${issue2.divisor} kat\u0131 olmal\u0131yd\u0131.`;
        case "unrecognized_keys":
          return `Tan\u0131nmayan anahtar ${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `${issue2.origin} i\xE7in tan\u0131nmayan anahtar var.`;
        case "invalid_union":
          return "Giren tan\u0131namad\u0131.";
        case "invalid_element":
          return `${issue2.origin} i\xE7in tan\u0131nmayan k\u0131ymet var.`;
        default:
          return `K\u0131ymet tan\u0131namad\u0131.`;
      }
    };
  };
  function ota_default() {
    return {
      localeError: error30()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ps.js
  var error31 = () => {
    const Sizable = {
      string: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
      file: { unit: "\u0628\u0627\u06CC\u067C\u0633", verb: "\u0648\u0644\u0631\u064A" },
      array: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
      set: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "\u0639\u062F\u062F";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "\u0627\u0631\u06D0";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u0648\u0631\u0648\u062F\u064A",
      email: "\u0628\u0631\u06CC\u069A\u0646\u0627\u0644\u06CC\u06A9",
      url: "\u06CC\u0648 \u0622\u0631 \u0627\u0644",
      emoji: "\u0627\u06CC\u0645\u0648\u062C\u064A",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\u0646\u06CC\u067C\u0647 \u0627\u0648 \u0648\u062E\u062A",
      date: "\u0646\u06D0\u067C\u0647",
      time: "\u0648\u062E\u062A",
      duration: "\u0645\u0648\u062F\u0647",
      ipv4: "\u062F IPv4 \u067E\u062A\u0647",
      ipv6: "\u062F IPv6 \u067E\u062A\u0647",
      cidrv4: "\u062F IPv4 \u0633\u0627\u062D\u0647",
      cidrv6: "\u062F IPv6 \u0633\u0627\u062D\u0647",
      base64: "base64-encoded \u0645\u062A\u0646",
      base64url: "base64url-encoded \u0645\u062A\u0646",
      json_string: "JSON \u0645\u062A\u0646",
      e164: "\u062F E.164 \u0634\u0645\u06D0\u0631\u0647",
      jwt: "JWT",
      template_literal: "\u0648\u0631\u0648\u062F\u064A"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${issue2.expected} \u0648\u0627\u06CC, \u0645\u06AB\u0631 ${parsedType8(issue2.input)} \u062A\u0631\u0644\u0627\u0633\u0647 \u0634\u0648`;
        case "invalid_value":
          if (issue2.values.length === 1) {
            return `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${stringifyPrimitive(issue2.values[0])} \u0648\u0627\u06CC`;
          }
          return `\u0646\u0627\u0633\u0645 \u0627\u0646\u062A\u062E\u0627\u0628: \u0628\u0627\u06CC\u062F \u06CC\u0648 \u0644\u0647 ${joinValues(issue2.values, "|")} \u0685\u062E\u0647 \u0648\u0627\u06CC`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${issue2.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0635\u0631\u0648\u0646\u0647"} \u0648\u0644\u0631\u064A`;
          }
          return `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${issue2.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} \u0648\u064A`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} ${sizing.unit} \u0648\u0644\u0631\u064A`;
          }
          return `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} \u0648\u064A`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${_issue.prefix}" \u0633\u0631\u0647 \u067E\u06CC\u0644 \u0634\u064A`;
          }
          if (_issue.format === "ends_with") {
            return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${_issue.suffix}" \u0633\u0631\u0647 \u067E\u0627\u06CC \u062A\u0647 \u0648\u0631\u0633\u064A\u0696\u064A`;
          }
          if (_issue.format === "includes") {
            return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F "${_issue.includes}" \u0648\u0644\u0631\u064A`;
          }
          if (_issue.format === "regex") {
            return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F ${_issue.pattern} \u0633\u0631\u0647 \u0645\u0637\u0627\u0628\u0642\u062A \u0648\u0644\u0631\u064A`;
          }
          return `${Nouns[_issue.format] ?? issue2.format} \u0646\u0627\u0633\u0645 \u062F\u06CC`;
        }
        case "not_multiple_of":
          return `\u0646\u0627\u0633\u0645 \u0639\u062F\u062F: \u0628\u0627\u06CC\u062F \u062F ${issue2.divisor} \u0645\u0636\u0631\u0628 \u0648\u064A`;
        case "unrecognized_keys":
          return `\u0646\u0627\u0633\u0645 ${issue2.keys.length > 1 ? "\u06A9\u0644\u06CC\u0689\u0648\u0646\u0647" : "\u06A9\u0644\u06CC\u0689"}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `\u0646\u0627\u0633\u0645 \u06A9\u0644\u06CC\u0689 \u067E\u0647 ${issue2.origin} \u06A9\u06D0`;
        case "invalid_union":
          return `\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A`;
        case "invalid_element":
          return `\u0646\u0627\u0633\u0645 \u0639\u0646\u0635\u0631 \u067E\u0647 ${issue2.origin} \u06A9\u06D0`;
        default:
          return `\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A`;
      }
    };
  };
  function ps_default() {
    return {
      localeError: error31()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/pl.js
  var error32 = () => {
    const Sizable = {
      string: { unit: "znak\xF3w", verb: "mie\u0107" },
      file: { unit: "bajt\xF3w", verb: "mie\u0107" },
      array: { unit: "element\xF3w", verb: "mie\u0107" },
      set: { unit: "element\xF3w", verb: "mie\u0107" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "liczba";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "tablica";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "wyra\u017Cenie",
      email: "adres email",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "data i godzina w formacie ISO",
      date: "data w formacie ISO",
      time: "godzina w formacie ISO",
      duration: "czas trwania ISO",
      ipv4: "adres IPv4",
      ipv6: "adres IPv6",
      cidrv4: "zakres IPv4",
      cidrv6: "zakres IPv6",
      base64: "ci\u0105g znak\xF3w zakodowany w formacie base64",
      base64url: "ci\u0105g znak\xF3w zakodowany w formacie base64url",
      json_string: "ci\u0105g znak\xF3w w formacie JSON",
      e164: "liczba E.164",
      jwt: "JWT",
      template_literal: "wej\u015Bcie"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${issue2.expected}, otrzymano ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${stringifyPrimitive(issue2.values[0])}`;
          return `Nieprawid\u0142owa opcja: oczekiwano jednej z warto\u015Bci ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Za du\u017Ca warto\u015B\u0107: oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "element\xF3w"}`;
          }
          return `Zbyt du\u017C(y/a/e): oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Za ma\u0142a warto\u015B\u0107: oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${adj}${issue2.minimum.toString()} ${sizing.unit ?? "element\xF3w"}`;
          }
          return `Zbyt ma\u0142(y/a/e): oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zaczyna\u0107 si\u0119 od "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi ko\u0144czy\u0107 si\u0119 na "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zawiera\u0107 "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi odpowiada\u0107 wzorcowi ${_issue.pattern}`;
          return `Nieprawid\u0142ow(y/a/e) ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `Nieprawid\u0142owa liczba: musi by\u0107 wielokrotno\u015Bci\u0105 ${issue2.divisor}`;
        case "unrecognized_keys":
          return `Nierozpoznane klucze${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Nieprawid\u0142owy klucz w ${issue2.origin}`;
        case "invalid_union":
          return "Nieprawid\u0142owe dane wej\u015Bciowe";
        case "invalid_element":
          return `Nieprawid\u0142owa warto\u015B\u0107 w ${issue2.origin}`;
        default:
          return `Nieprawid\u0142owe dane wej\u015Bciowe`;
      }
    };
  };
  function pl_default() {
    return {
      localeError: error32()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/pt.js
  var error33 = () => {
    const Sizable = {
      string: { unit: "caracteres", verb: "ter" },
      file: { unit: "bytes", verb: "ter" },
      array: { unit: "itens", verb: "ter" },
      set: { unit: "itens", verb: "ter" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "n\xFAmero";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "array";
          }
          if (data === null) {
            return "nulo";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "padr\xE3o",
      email: "endere\xE7o de e-mail",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "data e hora ISO",
      date: "data ISO",
      time: "hora ISO",
      duration: "dura\xE7\xE3o ISO",
      ipv4: "endere\xE7o IPv4",
      ipv6: "endere\xE7o IPv6",
      cidrv4: "faixa de IPv4",
      cidrv6: "faixa de IPv6",
      base64: "texto codificado em base64",
      base64url: "URL codificada em base64",
      json_string: "texto JSON",
      e164: "n\xFAmero E.164",
      jwt: "JWT",
      template_literal: "entrada"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Tipo inv\xE1lido: esperado ${issue2.expected}, recebido ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Entrada inv\xE1lida: esperado ${stringifyPrimitive(issue2.values[0])}`;
          return `Op\xE7\xE3o inv\xE1lida: esperada uma das ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `Muito grande: esperado que ${issue2.origin ?? "valor"} tivesse ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementos"}`;
          return `Muito grande: esperado que ${issue2.origin ?? "valor"} fosse ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Muito pequeno: esperado que ${issue2.origin} tivesse ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `Muito pequeno: esperado que ${issue2.origin} fosse ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `Texto inv\xE1lido: deve come\xE7ar com "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `Texto inv\xE1lido: deve terminar com "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Texto inv\xE1lido: deve incluir "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Texto inv\xE1lido: deve corresponder ao padr\xE3o ${_issue.pattern}`;
          return `${Nouns[_issue.format] ?? issue2.format} inv\xE1lido`;
        }
        case "not_multiple_of":
          return `N\xFAmero inv\xE1lido: deve ser m\xFAltiplo de ${issue2.divisor}`;
        case "unrecognized_keys":
          return `Chave${issue2.keys.length > 1 ? "s" : ""} desconhecida${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Chave inv\xE1lida em ${issue2.origin}`;
        case "invalid_union":
          return "Entrada inv\xE1lida";
        case "invalid_element":
          return `Valor inv\xE1lido em ${issue2.origin}`;
        default:
          return `Campo inv\xE1lido`;
      }
    };
  };
  function pt_default() {
    return {
      localeError: error33()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ru.js
  function getRussianPlural(count, one, few, many) {
    const absCount = Math.abs(count);
    const lastDigit = absCount % 10;
    const lastTwoDigits = absCount % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return many;
    }
    if (lastDigit === 1) {
      return one;
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return few;
    }
    return many;
  }
  var error34 = () => {
    const Sizable = {
      string: {
        unit: {
          one: "\u0441\u0438\u043C\u0432\u043E\u043B",
          few: "\u0441\u0438\u043C\u0432\u043E\u043B\u0430",
          many: "\u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432"
        },
        verb: "\u0438\u043C\u0435\u0442\u044C"
      },
      file: {
        unit: {
          one: "\u0431\u0430\u0439\u0442",
          few: "\u0431\u0430\u0439\u0442\u0430",
          many: "\u0431\u0430\u0439\u0442"
        },
        verb: "\u0438\u043C\u0435\u0442\u044C"
      },
      array: {
        unit: {
          one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
          few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
          many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432"
        },
        verb: "\u0438\u043C\u0435\u0442\u044C"
      },
      set: {
        unit: {
          one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
          few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
          many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432"
        },
        verb: "\u0438\u043C\u0435\u0442\u044C"
      }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "\u0447\u0438\u0441\u043B\u043E";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "\u043C\u0430\u0441\u0441\u0438\u0432";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u0432\u0432\u043E\u0434",
      email: "email \u0430\u0434\u0440\u0435\u0441",
      url: "URL",
      emoji: "\u044D\u043C\u043E\u0434\u0437\u0438",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0434\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043C\u044F",
      date: "ISO \u0434\u0430\u0442\u0430",
      time: "ISO \u0432\u0440\u0435\u043C\u044F",
      duration: "ISO \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
      ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441",
      ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441",
      cidrv4: "IPv4 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
      cidrv6: "IPv6 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
      base64: "\u0441\u0442\u0440\u043E\u043A\u0430 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 base64",
      base64url: "\u0441\u0442\u0440\u043E\u043A\u0430 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 base64url",
      json_string: "JSON \u0441\u0442\u0440\u043E\u043A\u0430",
      e164: "\u043D\u043E\u043C\u0435\u0440 E.164",
      jwt: "JWT",
      template_literal: "\u0432\u0432\u043E\u0434"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${issue2.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${stringifyPrimitive(issue2.values[0])}`;
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0430\u0440\u0438\u0430\u043D\u0442: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0434\u043D\u043E \u0438\u0437 ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            const maxValue = Number(issue2.maximum);
            const unit = getRussianPlural(maxValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
            return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${adj}${issue2.maximum.toString()} ${unit}`;
          }
          return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            const minValue = Number(issue2.minimum);
            const unit = getRussianPlural(minValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
            return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${adj}${issue2.minimum.toString()} ${unit}`;
          }
          return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin} \u0431\u0443\u0434\u0435\u0442 ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u043D\u0430\u0447\u0438\u043D\u0430\u0442\u044C\u0441\u044F \u0441 "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0437\u0430\u043A\u0430\u043D\u0447\u0438\u0432\u0430\u0442\u044C\u0441\u044F \u043D\u0430 "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${_issue.pattern}`;
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E: \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${issue2.divisor}`;
        case "unrecognized_keys":
          return `\u041D\u0435\u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u043D\u043D${issue2.keys.length > 1 ? "\u044B\u0435" : "\u044B\u0439"} \u043A\u043B\u044E\u0447${issue2.keys.length > 1 ? "\u0438" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043A\u043B\u044E\u0447 \u0432 ${issue2.origin}`;
        case "invalid_union":
          return "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435";
        case "invalid_element":
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0432 ${issue2.origin}`;
        default:
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435`;
      }
    };
  };
  function ru_default() {
    return {
      localeError: error34()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/sl.js
  var error35 = () => {
    const Sizable = {
      string: { unit: "znakov", verb: "imeti" },
      file: { unit: "bajtov", verb: "imeti" },
      array: { unit: "elementov", verb: "imeti" },
      set: { unit: "elementov", verb: "imeti" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "\u0161tevilo";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "tabela";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "vnos",
      email: "e-po\u0161tni naslov",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO datum in \u010Das",
      date: "ISO datum",
      time: "ISO \u010Das",
      duration: "ISO trajanje",
      ipv4: "IPv4 naslov",
      ipv6: "IPv6 naslov",
      cidrv4: "obseg IPv4",
      cidrv6: "obseg IPv6",
      base64: "base64 kodiran niz",
      base64url: "base64url kodiran niz",
      json_string: "JSON niz",
      e164: "E.164 \u0161tevilka",
      jwt: "JWT",
      template_literal: "vnos"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Neveljaven vnos: pri\u010Dakovano ${issue2.expected}, prejeto ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Neveljaven vnos: pri\u010Dakovano ${stringifyPrimitive(issue2.values[0])}`;
          return `Neveljavna mo\u017Enost: pri\u010Dakovano eno izmed ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `Preveliko: pri\u010Dakovano, da bo ${issue2.origin ?? "vrednost"} imelo ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementov"}`;
          return `Preveliko: pri\u010Dakovano, da bo ${issue2.origin ?? "vrednost"} ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Premajhno: pri\u010Dakovano, da bo ${issue2.origin} imelo ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `Premajhno: pri\u010Dakovano, da bo ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `Neveljaven niz: mora se za\u010Deti z "${_issue.prefix}"`;
          }
          if (_issue.format === "ends_with")
            return `Neveljaven niz: mora se kon\u010Dati z "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Neveljaven niz: mora vsebovati "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Neveljaven niz: mora ustrezati vzorcu ${_issue.pattern}`;
          return `Neveljaven ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `Neveljavno \u0161tevilo: mora biti ve\u010Dkratnik ${issue2.divisor}`;
        case "unrecognized_keys":
          return `Neprepoznan${issue2.keys.length > 1 ? "i klju\u010Di" : " klju\u010D"}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Neveljaven klju\u010D v ${issue2.origin}`;
        case "invalid_union":
          return "Neveljaven vnos";
        case "invalid_element":
          return `Neveljavna vrednost v ${issue2.origin}`;
        default:
          return "Neveljaven vnos";
      }
    };
  };
  function sl_default() {
    return {
      localeError: error35()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/sv.js
  var error36 = () => {
    const Sizable = {
      string: { unit: "tecken", verb: "att ha" },
      file: { unit: "bytes", verb: "att ha" },
      array: { unit: "objekt", verb: "att inneh\xE5lla" },
      set: { unit: "objekt", verb: "att inneh\xE5lla" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "antal";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "lista";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "regulj\xE4rt uttryck",
      email: "e-postadress",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO-datum och tid",
      date: "ISO-datum",
      time: "ISO-tid",
      duration: "ISO-varaktighet",
      ipv4: "IPv4-intervall",
      ipv6: "IPv6-intervall",
      cidrv4: "IPv4-spektrum",
      cidrv6: "IPv6-spektrum",
      base64: "base64-kodad str\xE4ng",
      base64url: "base64url-kodad str\xE4ng",
      json_string: "JSON-str\xE4ng",
      e164: "E.164-nummer",
      jwt: "JWT",
      template_literal: "mall-literal"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Ogiltig inmatning: f\xF6rv\xE4ntat ${issue2.expected}, fick ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Ogiltig inmatning: f\xF6rv\xE4ntat ${stringifyPrimitive(issue2.values[0])}`;
          return `Ogiltigt val: f\xF6rv\xE4ntade en av ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `F\xF6r stor(t): f\xF6rv\xE4ntade ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "element"}`;
          }
          return `F\xF6r stor(t): f\xF6rv\xE4ntat ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `F\xF6r lite(t): f\xF6rv\xE4ntade ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `F\xF6r lite(t): f\xF6rv\xE4ntade ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `Ogiltig str\xE4ng: m\xE5ste b\xF6rja med "${_issue.prefix}"`;
          }
          if (_issue.format === "ends_with")
            return `Ogiltig str\xE4ng: m\xE5ste sluta med "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Ogiltig str\xE4ng: m\xE5ste inneh\xE5lla "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Ogiltig str\xE4ng: m\xE5ste matcha m\xF6nstret "${_issue.pattern}"`;
          return `Ogiltig(t) ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `Ogiltigt tal: m\xE5ste vara en multipel av ${issue2.divisor}`;
        case "unrecognized_keys":
          return `${issue2.keys.length > 1 ? "Ok\xE4nda nycklar" : "Ok\xE4nd nyckel"}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Ogiltig nyckel i ${issue2.origin ?? "v\xE4rdet"}`;
        case "invalid_union":
          return "Ogiltig input";
        case "invalid_element":
          return `Ogiltigt v\xE4rde i ${issue2.origin ?? "v\xE4rdet"}`;
        default:
          return `Ogiltig input`;
      }
    };
  };
  function sv_default() {
    return {
      localeError: error36()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ta.js
  var error37 = () => {
    const Sizable = {
      string: { unit: "\u0B8E\u0BB4\u0BC1\u0BA4\u0BCD\u0BA4\u0BC1\u0B95\u0BCD\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" },
      file: { unit: "\u0BAA\u0BC8\u0B9F\u0BCD\u0B9F\u0BC1\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" },
      array: { unit: "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" },
      set: { unit: "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "\u0B8E\u0BA3\u0BCD \u0B85\u0BB2\u0BCD\u0BB2\u0BBE\u0BA4\u0BA4\u0BC1" : "\u0B8E\u0BA3\u0BCD";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "\u0B85\u0BA3\u0BBF";
          }
          if (data === null) {
            return "\u0BB5\u0BC6\u0BB1\u0BC1\u0BAE\u0BC8";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1",
      email: "\u0BAE\u0BBF\u0BA9\u0BCD\u0BA9\u0B9E\u0BCD\u0B9A\u0BB2\u0BCD \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u0BA4\u0BC7\u0BA4\u0BBF \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD",
      date: "ISO \u0BA4\u0BC7\u0BA4\u0BBF",
      time: "ISO \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD",
      duration: "ISO \u0B95\u0BBE\u0BB2 \u0B85\u0BB3\u0BB5\u0BC1",
      ipv4: "IPv4 \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
      ipv6: "IPv6 \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
      cidrv4: "IPv4 \u0BB5\u0BB0\u0BAE\u0BCD\u0BAA\u0BC1",
      cidrv6: "IPv6 \u0BB5\u0BB0\u0BAE\u0BCD\u0BAA\u0BC1",
      base64: "base64-encoded \u0B9A\u0BB0\u0BAE\u0BCD",
      base64url: "base64url-encoded \u0B9A\u0BB0\u0BAE\u0BCD",
      json_string: "JSON \u0B9A\u0BB0\u0BAE\u0BCD",
      e164: "E.164 \u0B8E\u0BA3\u0BCD",
      jwt: "JWT",
      template_literal: "input"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.expected}, \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${stringifyPrimitive(issue2.values[0])}`;
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0BB0\u0BC1\u0BAA\u0BCD\u0BAA\u0BAE\u0BCD: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${joinValues(issue2.values, "|")} \u0B87\u0BB2\u0BCD \u0B92\u0BA9\u0BCD\u0BB1\u0BC1`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD"} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
          }
          return `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${adj}${issue2.maximum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
          }
          return `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin} ${adj}${issue2.minimum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${_issue.prefix}" \u0B87\u0BB2\u0BCD \u0BA4\u0BCA\u0B9F\u0B99\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
          if (_issue.format === "ends_with")
            return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${_issue.suffix}" \u0B87\u0BB2\u0BCD \u0BAE\u0BC1\u0B9F\u0BBF\u0BB5\u0B9F\u0BC8\u0BAF \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
          if (_issue.format === "includes")
            return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${_issue.includes}" \u0B90 \u0B89\u0BB3\u0BCD\u0BB3\u0B9F\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
          if (_issue.format === "regex")
            return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: ${_issue.pattern} \u0BAE\u0BC1\u0BB1\u0BC8\u0BAA\u0BBE\u0B9F\u0BCD\u0B9F\u0BC1\u0B9F\u0BA9\u0BCD \u0BAA\u0BCA\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B8E\u0BA3\u0BCD: ${issue2.divisor} \u0B87\u0BA9\u0BCD \u0BAA\u0BB2\u0BAE\u0BBE\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
        case "unrecognized_keys":
          return `\u0B85\u0B9F\u0BC8\u0BAF\u0BBE\u0BB3\u0BAE\u0BCD \u0BA4\u0BC6\u0BB0\u0BBF\u0BAF\u0BBE\u0BA4 \u0BB5\u0BBF\u0B9A\u0BC8${issue2.keys.length > 1 ? "\u0B95\u0BB3\u0BCD" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `${issue2.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0B9A\u0BC8`;
        case "invalid_union":
          return "\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1";
        case "invalid_element":
          return `${issue2.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1`;
        default:
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1`;
      }
    };
  };
  function ta_default() {
    return {
      localeError: error37()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/th.js
  var error38 = () => {
    const Sizable = {
      string: { unit: "\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
      file: { unit: "\u0E44\u0E1A\u0E15\u0E4C", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
      array: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
      set: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "\u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02 (NaN)" : "\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "\u0E2D\u0E32\u0E23\u0E4C\u0E40\u0E23\u0E22\u0E4C (Array)";
          }
          if (data === null) {
            return "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E48\u0E32 (null)";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1B\u0E49\u0E2D\u0E19",
      email: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48\u0E2D\u0E35\u0E40\u0E21\u0E25",
      url: "URL",
      emoji: "\u0E2D\u0E34\u0E42\u0E21\u0E08\u0E34",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
      date: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1A\u0E1A ISO",
      time: "\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
      duration: "\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
      ipv4: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48 IPv4",
      ipv6: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48 IPv6",
      cidrv4: "\u0E0A\u0E48\u0E27\u0E07 IP \u0E41\u0E1A\u0E1A IPv4",
      cidrv6: "\u0E0A\u0E48\u0E27\u0E07 IP \u0E41\u0E1A\u0E1A IPv6",
      base64: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A Base64",
      base64url: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A Base64 \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A URL",
      json_string: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A JSON",
      e164: "\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 (E.164)",
      jwt: "\u0E42\u0E17\u0E40\u0E04\u0E19 JWT",
      template_literal: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1B\u0E49\u0E2D\u0E19"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${issue2.expected} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\u0E04\u0E48\u0E32\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${stringifyPrimitive(issue2.values[0])}`;
          return `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19\u0E2B\u0E19\u0E36\u0E48\u0E07\u0E43\u0E19 ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "\u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19" : "\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"}`;
          return `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? "\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22" : "\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E02\u0E36\u0E49\u0E19\u0E15\u0E49\u0E19\u0E14\u0E49\u0E27\u0E22 "${_issue.prefix}"`;
          }
          if (_issue.format === "ends_with")
            return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E25\u0E07\u0E17\u0E49\u0E32\u0E22\u0E14\u0E49\u0E27\u0E22 "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35 "${_issue.includes}" \u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21`;
          if (_issue.format === "regex")
            return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14 ${_issue.pattern}`;
          return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E08\u0E33\u0E19\u0E27\u0E19\u0E17\u0E35\u0E48\u0E2B\u0E32\u0E23\u0E14\u0E49\u0E27\u0E22 ${issue2.divisor} \u0E44\u0E14\u0E49\u0E25\u0E07\u0E15\u0E31\u0E27`;
        case "unrecognized_keys":
          return `\u0E1E\u0E1A\u0E04\u0E35\u0E22\u0E4C\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E23\u0E39\u0E49\u0E08\u0E31\u0E01: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `\u0E04\u0E35\u0E22\u0E4C\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${issue2.origin}`;
        case "invalid_union":
          return "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E44\u0E21\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E22\u0E39\u0E40\u0E19\u0E35\u0E22\u0E19\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E44\u0E27\u0E49";
        case "invalid_element":
          return `\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${issue2.origin}`;
        default:
          return `\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07`;
      }
    };
  };
  function th_default() {
    return {
      localeError: error38()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/tr.js
  var parsedType7 = (data) => {
    const t = typeof data;
    switch (t) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "number";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "array";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t;
  };
  var error39 = () => {
    const Sizable = {
      string: { unit: "karakter", verb: "olmal\u0131" },
      file: { unit: "bayt", verb: "olmal\u0131" },
      array: { unit: "\xF6\u011Fe", verb: "olmal\u0131" },
      set: { unit: "\xF6\u011Fe", verb: "olmal\u0131" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const Nouns = {
      regex: "girdi",
      email: "e-posta adresi",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO tarih ve saat",
      date: "ISO tarih",
      time: "ISO saat",
      duration: "ISO s\xFCre",
      ipv4: "IPv4 adresi",
      ipv6: "IPv6 adresi",
      cidrv4: "IPv4 aral\u0131\u011F\u0131",
      cidrv6: "IPv6 aral\u0131\u011F\u0131",
      base64: "base64 ile \u015Fifrelenmi\u015F metin",
      base64url: "base64url ile \u015Fifrelenmi\u015F metin",
      json_string: "JSON dizesi",
      e164: "E.164 say\u0131s\u0131",
      jwt: "JWT",
      template_literal: "\u015Eablon dizesi"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `Ge\xE7ersiz de\u011Fer: beklenen ${issue2.expected}, al\u0131nan ${parsedType7(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `Ge\xE7ersiz de\u011Fer: beklenen ${stringifyPrimitive(issue2.values[0])}`;
          return `Ge\xE7ersiz se\xE7enek: a\u015Fa\u011F\u0131dakilerden biri olmal\u0131: ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `\xC7ok b\xFCy\xFCk: beklenen ${issue2.origin ?? "de\u011Fer"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\xF6\u011Fe"}`;
          return `\xC7ok b\xFCy\xFCk: beklenen ${issue2.origin ?? "de\u011Fer"} ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `\xC7ok k\xFC\xE7\xFCk: beklenen ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          return `\xC7ok k\xFC\xE7\xFCk: beklenen ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `Ge\xE7ersiz metin: "${_issue.prefix}" ile ba\u015Flamal\u0131`;
          if (_issue.format === "ends_with")
            return `Ge\xE7ersiz metin: "${_issue.suffix}" ile bitmeli`;
          if (_issue.format === "includes")
            return `Ge\xE7ersiz metin: "${_issue.includes}" i\xE7ermeli`;
          if (_issue.format === "regex")
            return `Ge\xE7ersiz metin: ${_issue.pattern} desenine uymal\u0131`;
          return `Ge\xE7ersiz ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `Ge\xE7ersiz say\u0131: ${issue2.divisor} ile tam b\xF6l\xFCnebilmeli`;
        case "unrecognized_keys":
          return `Tan\u0131nmayan anahtar${issue2.keys.length > 1 ? "lar" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `${issue2.origin} i\xE7inde ge\xE7ersiz anahtar`;
        case "invalid_union":
          return "Ge\xE7ersiz de\u011Fer";
        case "invalid_element":
          return `${issue2.origin} i\xE7inde ge\xE7ersiz de\u011Fer`;
        default:
          return `Ge\xE7ersiz de\u011Fer`;
      }
    };
  };
  function tr_default() {
    return {
      localeError: error39()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/uk.js
  var error40 = () => {
    const Sizable = {
      string: { unit: "\u0441\u0438\u043C\u0432\u043E\u043B\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" },
      file: { unit: "\u0431\u0430\u0439\u0442\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" },
      array: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" },
      set: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "\u0447\u0438\u0441\u043B\u043E";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "\u043C\u0430\u0441\u0438\u0432";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456",
      email: "\u0430\u0434\u0440\u0435\u0441\u0430 \u0435\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0457 \u043F\u043E\u0448\u0442\u0438",
      url: "URL",
      emoji: "\u0435\u043C\u043E\u0434\u0437\u0456",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\u0434\u0430\u0442\u0430 \u0442\u0430 \u0447\u0430\u0441 ISO",
      date: "\u0434\u0430\u0442\u0430 ISO",
      time: "\u0447\u0430\u0441 ISO",
      duration: "\u0442\u0440\u0438\u0432\u0430\u043B\u0456\u0441\u0442\u044C ISO",
      ipv4: "\u0430\u0434\u0440\u0435\u0441\u0430 IPv4",
      ipv6: "\u0430\u0434\u0440\u0435\u0441\u0430 IPv6",
      cidrv4: "\u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D IPv4",
      cidrv6: "\u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D IPv6",
      base64: "\u0440\u044F\u0434\u043E\u043A \u0443 \u043A\u043E\u0434\u0443\u0432\u0430\u043D\u043D\u0456 base64",
      base64url: "\u0440\u044F\u0434\u043E\u043A \u0443 \u043A\u043E\u0434\u0443\u0432\u0430\u043D\u043D\u0456 base64url",
      json_string: "\u0440\u044F\u0434\u043E\u043A JSON",
      e164: "\u043D\u043E\u043C\u0435\u0440 E.164",
      jwt: "JWT",
      template_literal: "\u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${issue2.expected}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E ${parsedType8(issue2.input)}`;
        // return `Неправильні вхідні дані: очікується ${issue.expected}, отримано ${util.getParsedType(issue.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${stringifyPrimitive(issue2.values[0])}`;
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0430 \u043E\u043F\u0446\u0456\u044F: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F \u043E\u0434\u043D\u0435 \u0437 ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432"}`;
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} \u0431\u0443\u0434\u0435 ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin} \u0431\u0443\u0434\u0435 ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043F\u043E\u0447\u0438\u043D\u0430\u0442\u0438\u0441\u044F \u0437 "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0437\u0430\u043A\u0456\u043D\u0447\u0443\u0432\u0430\u0442\u0438\u0441\u044F \u043D\u0430 "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043C\u0456\u0441\u0442\u0438\u0442\u0438 "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0430\u0442\u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${_issue.pattern}`;
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0447\u0438\u0441\u043B\u043E: \u043F\u043E\u0432\u0438\u043D\u043D\u043E \u0431\u0443\u0442\u0438 \u043A\u0440\u0430\u0442\u043D\u0438\u043C ${issue2.divisor}`;
        case "unrecognized_keys":
          return `\u041D\u0435\u0440\u043E\u0437\u043F\u0456\u0437\u043D\u0430\u043D\u0438\u0439 \u043A\u043B\u044E\u0447${issue2.keys.length > 1 ? "\u0456" : ""}: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u043A\u043B\u044E\u0447 \u0443 ${issue2.origin}`;
        case "invalid_union":
          return "\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456";
        case "invalid_element":
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u0443 ${issue2.origin}`;
        default:
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456`;
      }
    };
  };
  function uk_default() {
    return {
      localeError: error40()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ua.js
  function ua_default() {
    return uk_default();
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ur.js
  var error41 = () => {
    const Sizable = {
      string: { unit: "\u062D\u0631\u0648\u0641", verb: "\u06C1\u0648\u0646\u0627" },
      file: { unit: "\u0628\u0627\u0626\u0679\u0633", verb: "\u06C1\u0648\u0646\u0627" },
      array: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" },
      set: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "\u0646\u0645\u0628\u0631";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "\u0622\u0631\u06D2";
          }
          if (data === null) {
            return "\u0646\u0644";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u0627\u0646 \u067E\u0679",
      email: "\u0627\u06CC \u0645\u06CC\u0644 \u0627\u06CC\u0688\u0631\u06CC\u0633",
      url: "\u06CC\u0648 \u0622\u0631 \u0627\u06CC\u0644",
      emoji: "\u0627\u06CC\u0645\u0648\u062C\u06CC",
      uuid: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
      uuidv4: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC \u0648\u06CC 4",
      uuidv6: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC \u0648\u06CC 6",
      nanoid: "\u0646\u06CC\u0646\u0648 \u0622\u0626\u06CC \u0688\u06CC",
      guid: "\u062C\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
      cuid: "\u0633\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
      cuid2: "\u0633\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC 2",
      ulid: "\u06CC\u0648 \u0627\u06CC\u0644 \u0622\u0626\u06CC \u0688\u06CC",
      xid: "\u0627\u06CC\u06A9\u0633 \u0622\u0626\u06CC \u0688\u06CC",
      ksuid: "\u06A9\u06D2 \u0627\u06CC\u0633 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
      datetime: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0688\u06CC\u0679 \u0679\u0627\u0626\u0645",
      date: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u062A\u0627\u0631\u06CC\u062E",
      time: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0648\u0642\u062A",
      duration: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0645\u062F\u062A",
      ipv4: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 4 \u0627\u06CC\u0688\u0631\u06CC\u0633",
      ipv6: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 6 \u0627\u06CC\u0688\u0631\u06CC\u0633",
      cidrv4: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 4 \u0631\u06CC\u0646\u062C",
      cidrv6: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 6 \u0631\u06CC\u0646\u062C",
      base64: "\u0628\u06CC\u0633 64 \u0627\u0646 \u06A9\u0648\u0688\u0688 \u0633\u0679\u0631\u0646\u06AF",
      base64url: "\u0628\u06CC\u0633 64 \u06CC\u0648 \u0622\u0631 \u0627\u06CC\u0644 \u0627\u0646 \u06A9\u0648\u0688\u0688 \u0633\u0679\u0631\u0646\u06AF",
      json_string: "\u062C\u06D2 \u0627\u06CC\u0633 \u0627\u0648 \u0627\u06CC\u0646 \u0633\u0679\u0631\u0646\u06AF",
      e164: "\u0627\u06CC 164 \u0646\u0645\u0628\u0631",
      jwt: "\u062C\u06D2 \u0688\u0628\u0644\u06CC\u0648 \u0679\u06CC",
      template_literal: "\u0627\u0646 \u067E\u0679"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${issue2.expected} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C ${parsedType8(issue2.input)} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${stringifyPrimitive(issue2.values[0])} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
          return `\u063A\u0644\u0637 \u0622\u067E\u0634\u0646: ${joinValues(issue2.values, "|")} \u0645\u06CC\u06BA \u0633\u06D2 \u0627\u06CC\u06A9 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `\u0628\u06C1\u062A \u0628\u0691\u0627: ${issue2.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u06D2 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0627\u0635\u0631"} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`;
          return `\u0628\u06C1\u062A \u0628\u0691\u0627: ${issue2.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u0627 ${adj}${issue2.maximum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${issue2.origin} \u06A9\u06D2 ${adj}${issue2.minimum.toString()} ${sizing.unit} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`;
          }
          return `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${issue2.origin} \u06A9\u0627 ${adj}${issue2.minimum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${_issue.prefix}" \u0633\u06D2 \u0634\u0631\u0648\u0639 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
          }
          if (_issue.format === "ends_with")
            return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${_issue.suffix}" \u067E\u0631 \u062E\u062A\u0645 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
          if (_issue.format === "includes")
            return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${_issue.includes}" \u0634\u0627\u0645\u0644 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
          if (_issue.format === "regex")
            return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: \u067E\u06CC\u0679\u0631\u0646 ${_issue.pattern} \u0633\u06D2 \u0645\u06CC\u0686 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
          return `\u063A\u0644\u0637 ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `\u063A\u0644\u0637 \u0646\u0645\u0628\u0631: ${issue2.divisor} \u06A9\u0627 \u0645\u0636\u0627\u0639\u0641 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
        case "unrecognized_keys":
          return `\u063A\u06CC\u0631 \u062A\u0633\u0644\u06CC\u0645 \u0634\u062F\u06C1 \u06A9\u06CC${issue2.keys.length > 1 ? "\u0632" : ""}: ${joinValues(issue2.keys, "\u060C ")}`;
        case "invalid_key":
          return `${issue2.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u06A9\u06CC`;
        case "invalid_union":
          return "\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679";
        case "invalid_element":
          return `${issue2.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u0648\u06CC\u0644\u06CC\u0648`;
        default:
          return `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679`;
      }
    };
  };
  function ur_default() {
    return {
      localeError: error41()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/vi.js
  var error42 = () => {
    const Sizable = {
      string: { unit: "k\xFD t\u1EF1", verb: "c\xF3" },
      file: { unit: "byte", verb: "c\xF3" },
      array: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" },
      set: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "s\u1ED1";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "m\u1EA3ng";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u0111\u1EA7u v\xE0o",
      email: "\u0111\u1ECBa ch\u1EC9 email",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ng\xE0y gi\u1EDD ISO",
      date: "ng\xE0y ISO",
      time: "gi\u1EDD ISO",
      duration: "kho\u1EA3ng th\u1EDDi gian ISO",
      ipv4: "\u0111\u1ECBa ch\u1EC9 IPv4",
      ipv6: "\u0111\u1ECBa ch\u1EC9 IPv6",
      cidrv4: "d\u1EA3i IPv4",
      cidrv6: "d\u1EA3i IPv6",
      base64: "chu\u1ED7i m\xE3 h\xF3a base64",
      base64url: "chu\u1ED7i m\xE3 h\xF3a base64url",
      json_string: "chu\u1ED7i JSON",
      e164: "s\u1ED1 E.164",
      jwt: "JWT",
      template_literal: "\u0111\u1EA7u v\xE0o"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${issue2.expected}, nh\u1EADn \u0111\u01B0\u1EE3c ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${stringifyPrimitive(issue2.values[0])}`;
          return `T\xF9y ch\u1ECDn kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i m\u1ED9t trong c\xE1c gi\xE1 tr\u1ECB ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${issue2.origin ?? "gi\xE1 tr\u1ECB"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "ph\u1EA7n t\u1EED"}`;
          return `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${issue2.origin ?? "gi\xE1 tr\u1ECB"} ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i b\u1EAFt \u0111\u1EA7u b\u1EB1ng "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i k\u1EBFt th\xFAc b\u1EB1ng "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i bao g\u1ED3m "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i kh\u1EDBp v\u1EDBi m\u1EABu ${_issue.pattern}`;
          return `${Nouns[_issue.format] ?? issue2.format} kh\xF4ng h\u1EE3p l\u1EC7`;
        }
        case "not_multiple_of":
          return `S\u1ED1 kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i l\xE0 b\u1ED9i s\u1ED1 c\u1EE7a ${issue2.divisor}`;
        case "unrecognized_keys":
          return `Kh\xF3a kh\xF4ng \u0111\u01B0\u1EE3c nh\u1EADn d\u1EA1ng: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `Kh\xF3a kh\xF4ng h\u1EE3p l\u1EC7 trong ${issue2.origin}`;
        case "invalid_union":
          return "\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7";
        case "invalid_element":
          return `Gi\xE1 tr\u1ECB kh\xF4ng h\u1EE3p l\u1EC7 trong ${issue2.origin}`;
        default:
          return `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7`;
      }
    };
  };
  function vi_default() {
    return {
      localeError: error42()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/zh-CN.js
  var error43 = () => {
    const Sizable = {
      string: { unit: "\u5B57\u7B26", verb: "\u5305\u542B" },
      file: { unit: "\u5B57\u8282", verb: "\u5305\u542B" },
      array: { unit: "\u9879", verb: "\u5305\u542B" },
      set: { unit: "\u9879", verb: "\u5305\u542B" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "\u975E\u6570\u5B57(NaN)" : "\u6570\u5B57";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "\u6570\u7EC4";
          }
          if (data === null) {
            return "\u7A7A\u503C(null)";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u8F93\u5165",
      email: "\u7535\u5B50\u90AE\u4EF6",
      url: "URL",
      emoji: "\u8868\u60C5\u7B26\u53F7",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO\u65E5\u671F\u65F6\u95F4",
      date: "ISO\u65E5\u671F",
      time: "ISO\u65F6\u95F4",
      duration: "ISO\u65F6\u957F",
      ipv4: "IPv4\u5730\u5740",
      ipv6: "IPv6\u5730\u5740",
      cidrv4: "IPv4\u7F51\u6BB5",
      cidrv6: "IPv6\u7F51\u6BB5",
      base64: "base64\u7F16\u7801\u5B57\u7B26\u4E32",
      base64url: "base64url\u7F16\u7801\u5B57\u7B26\u4E32",
      json_string: "JSON\u5B57\u7B26\u4E32",
      e164: "E.164\u53F7\u7801",
      jwt: "JWT",
      template_literal: "\u8F93\u5165"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${issue2.expected}\uFF0C\u5B9E\u9645\u63A5\u6536 ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${stringifyPrimitive(issue2.values[0])}`;
          return `\u65E0\u6548\u9009\u9879\uFF1A\u671F\u671B\u4EE5\u4E0B\u4E4B\u4E00 ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${issue2.origin ?? "\u503C"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u4E2A\u5143\u7D20"}`;
          return `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${issue2.origin ?? "\u503C"} ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${_issue.prefix}" \u5F00\u5934`;
          if (_issue.format === "ends_with")
            return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${_issue.suffix}" \u7ED3\u5C3E`;
          if (_issue.format === "includes")
            return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u5305\u542B "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u6EE1\u8DB3\u6B63\u5219\u8868\u8FBE\u5F0F ${_issue.pattern}`;
          return `\u65E0\u6548${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `\u65E0\u6548\u6570\u5B57\uFF1A\u5FC5\u987B\u662F ${issue2.divisor} \u7684\u500D\u6570`;
        case "unrecognized_keys":
          return `\u51FA\u73B0\u672A\u77E5\u7684\u952E(key): ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `${issue2.origin} \u4E2D\u7684\u952E(key)\u65E0\u6548`;
        case "invalid_union":
          return "\u65E0\u6548\u8F93\u5165";
        case "invalid_element":
          return `${issue2.origin} \u4E2D\u5305\u542B\u65E0\u6548\u503C(value)`;
        default:
          return `\u65E0\u6548\u8F93\u5165`;
      }
    };
  };
  function zh_CN_default() {
    return {
      localeError: error43()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/zh-TW.js
  var error44 = () => {
    const Sizable = {
      string: { unit: "\u5B57\u5143", verb: "\u64C1\u6709" },
      file: { unit: "\u4F4D\u5143\u7D44", verb: "\u64C1\u6709" },
      array: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" },
      set: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "number";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "array";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u8F38\u5165",
      email: "\u90F5\u4EF6\u5730\u5740",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "ISO \u65E5\u671F\u6642\u9593",
      date: "ISO \u65E5\u671F",
      time: "ISO \u6642\u9593",
      duration: "ISO \u671F\u9593",
      ipv4: "IPv4 \u4F4D\u5740",
      ipv6: "IPv6 \u4F4D\u5740",
      cidrv4: "IPv4 \u7BC4\u570D",
      cidrv6: "IPv6 \u7BC4\u570D",
      base64: "base64 \u7DE8\u78BC\u5B57\u4E32",
      base64url: "base64url \u7DE8\u78BC\u5B57\u4E32",
      json_string: "JSON \u5B57\u4E32",
      e164: "E.164 \u6578\u503C",
      jwt: "JWT",
      template_literal: "\u8F38\u5165"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${issue2.expected}\uFF0C\u4F46\u6536\u5230 ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${stringifyPrimitive(issue2.values[0])}`;
          return `\u7121\u6548\u7684\u9078\u9805\uFF1A\u9810\u671F\u70BA\u4EE5\u4E0B\u5176\u4E2D\u4E4B\u4E00 ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${issue2.origin ?? "\u503C"} \u61C9\u70BA ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u500B\u5143\u7D20"}`;
          return `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${issue2.origin ?? "\u503C"} \u61C9\u70BA ${adj}${issue2.maximum.toString()}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing) {
            return `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${issue2.origin} \u61C9\u70BA ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
          }
          return `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${issue2.origin} \u61C9\u70BA ${adj}${issue2.minimum.toString()}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with") {
            return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${_issue.prefix}" \u958B\u982D`;
          }
          if (_issue.format === "ends_with")
            return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${_issue.suffix}" \u7D50\u5C3E`;
          if (_issue.format === "includes")
            return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u5305\u542B "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u7B26\u5408\u683C\u5F0F ${_issue.pattern}`;
          return `\u7121\u6548\u7684 ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `\u7121\u6548\u7684\u6578\u5B57\uFF1A\u5FC5\u9808\u70BA ${issue2.divisor} \u7684\u500D\u6578`;
        case "unrecognized_keys":
          return `\u7121\u6CD5\u8B58\u5225\u7684\u9375\u503C${issue2.keys.length > 1 ? "\u5011" : ""}\uFF1A${joinValues(issue2.keys, "\u3001")}`;
        case "invalid_key":
          return `${issue2.origin} \u4E2D\u6709\u7121\u6548\u7684\u9375\u503C`;
        case "invalid_union":
          return "\u7121\u6548\u7684\u8F38\u5165\u503C";
        case "invalid_element":
          return `${issue2.origin} \u4E2D\u6709\u7121\u6548\u7684\u503C`;
        default:
          return `\u7121\u6548\u7684\u8F38\u5165\u503C`;
      }
    };
  };
  function zh_TW_default() {
    return {
      localeError: error44()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/yo.js
  var error45 = () => {
    const Sizable = {
      string: { unit: "\xE0mi", verb: "n\xED" },
      file: { unit: "bytes", verb: "n\xED" },
      array: { unit: "nkan", verb: "n\xED" },
      set: { unit: "nkan", verb: "n\xED" }
    };
    function getSizing(origin) {
      return Sizable[origin] ?? null;
    }
    const parsedType8 = (data) => {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "NaN" : "n\u1ECD\u0301mb\xE0";
        }
        case "object": {
          if (Array.isArray(data)) {
            return "akop\u1ECD";
          }
          if (data === null) {
            return "null";
          }
          if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
            return data.constructor.name;
          }
        }
      }
      return t;
    };
    const Nouns = {
      regex: "\u1EB9\u0300r\u1ECD \xECb\xE1w\u1ECDl\xE9",
      email: "\xE0d\xEDr\u1EB9\u0301s\xEC \xECm\u1EB9\u0301l\xEC",
      url: "URL",
      emoji: "emoji",
      uuid: "UUID",
      uuidv4: "UUIDv4",
      uuidv6: "UUIDv6",
      nanoid: "nanoid",
      guid: "GUID",
      cuid: "cuid",
      cuid2: "cuid2",
      ulid: "ULID",
      xid: "XID",
      ksuid: "KSUID",
      datetime: "\xE0k\xF3k\xF2 ISO",
      date: "\u1ECDj\u1ECD\u0301 ISO",
      time: "\xE0k\xF3k\xF2 ISO",
      duration: "\xE0k\xF3k\xF2 t\xF3 p\xE9 ISO",
      ipv4: "\xE0d\xEDr\u1EB9\u0301s\xEC IPv4",
      ipv6: "\xE0d\xEDr\u1EB9\u0301s\xEC IPv6",
      cidrv4: "\xE0gb\xE8gb\xE8 IPv4",
      cidrv6: "\xE0gb\xE8gb\xE8 IPv6",
      base64: "\u1ECD\u0300r\u1ECD\u0300 t\xED a k\u1ECD\u0301 n\xED base64",
      base64url: "\u1ECD\u0300r\u1ECD\u0300 base64url",
      json_string: "\u1ECD\u0300r\u1ECD\u0300 JSON",
      e164: "n\u1ECD\u0301mb\xE0 E.164",
      jwt: "JWT",
      template_literal: "\u1EB9\u0300r\u1ECD \xECb\xE1w\u1ECDl\xE9"
    };
    return (issue2) => {
      switch (issue2.code) {
        case "invalid_type":
          return `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${issue2.expected}, \xE0m\u1ECD\u0300 a r\xED ${parsedType8(issue2.input)}`;
        case "invalid_value":
          if (issue2.values.length === 1)
            return `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${stringifyPrimitive(issue2.values[0])}`;
          return `\xC0\u1E63\xE0y\xE0n a\u1E63\xEC\u1E63e: yan \u1ECD\u0300kan l\xE1ra ${joinValues(issue2.values, "|")}`;
        case "too_big": {
          const adj = issue2.inclusive ? "<=" : "<";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${issue2.origin ?? "iye"} ${sizing.verb} ${adj}${issue2.maximum} ${sizing.unit}`;
          return `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 ${adj}${issue2.maximum}`;
        }
        case "too_small": {
          const adj = issue2.inclusive ? ">=" : ">";
          const sizing = getSizing(issue2.origin);
          if (sizing)
            return `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum} ${sizing.unit}`;
          return `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 ${adj}${issue2.minimum}`;
        }
        case "invalid_format": {
          const _issue = issue2;
          if (_issue.format === "starts_with")
            return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\u1EB9\u0300r\u1EB9\u0300 p\u1EB9\u0300l\xFA "${_issue.prefix}"`;
          if (_issue.format === "ends_with")
            return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 par\xED p\u1EB9\u0300l\xFA "${_issue.suffix}"`;
          if (_issue.format === "includes")
            return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 n\xED "${_issue.includes}"`;
          if (_issue.format === "regex")
            return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\xE1 \xE0p\u1EB9\u1EB9r\u1EB9 mu ${_issue.pattern}`;
          return `A\u1E63\xEC\u1E63e: ${Nouns[_issue.format] ?? issue2.format}`;
        }
        case "not_multiple_of":
          return `N\u1ECD\u0301mb\xE0 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 j\u1EB9\u0301 \xE8y\xE0 p\xEDp\xEDn ti ${issue2.divisor}`;
        case "unrecognized_keys":
          return `B\u1ECDt\xECn\xEC \xE0\xECm\u1ECD\u0300: ${joinValues(issue2.keys, ", ")}`;
        case "invalid_key":
          return `B\u1ECDt\xECn\xEC a\u1E63\xEC\u1E63e n\xEDn\xFA ${issue2.origin}`;
        case "invalid_union":
          return "\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e";
        case "invalid_element":
          return `Iye a\u1E63\xEC\u1E63e n\xEDn\xFA ${issue2.origin}`;
        default:
          return "\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e";
      }
    };
  };
  function yo_default() {
    return {
      localeError: error45()
    };
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/registries.js
  var _a;
  var $output = Symbol("ZodOutput");
  var $input = Symbol("ZodInput");
  var $ZodRegistry = class {
    constructor() {
      this._map = /* @__PURE__ */ new WeakMap();
      this._idmap = /* @__PURE__ */ new Map();
    }
    add(schema, ..._meta) {
      const meta3 = _meta[0];
      this._map.set(schema, meta3);
      if (meta3 && typeof meta3 === "object" && "id" in meta3) {
        if (this._idmap.has(meta3.id)) {
          throw new Error(`ID ${meta3.id} already exists in the registry`);
        }
        this._idmap.set(meta3.id, schema);
      }
      return this;
    }
    clear() {
      this._map = /* @__PURE__ */ new WeakMap();
      this._idmap = /* @__PURE__ */ new Map();
      return this;
    }
    remove(schema) {
      const meta3 = this._map.get(schema);
      if (meta3 && typeof meta3 === "object" && "id" in meta3) {
        this._idmap.delete(meta3.id);
      }
      this._map.delete(schema);
      return this;
    }
    get(schema) {
      const p = schema._zod.parent;
      if (p) {
        const pm = { ...this.get(p) ?? {} };
        delete pm.id;
        const f = { ...pm, ...this._map.get(schema) };
        return Object.keys(f).length ? f : void 0;
      }
      return this._map.get(schema);
    }
    has(schema) {
      return this._map.has(schema);
    }
  };
  function registry() {
    return new $ZodRegistry();
  }
  (_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
  var globalRegistry = globalThis.__zod_globalRegistry;

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/api.js
  function _string(Class2, params) {
    return new Class2({
      type: "string",
      ...normalizeParams(params)
    });
  }
  function _coercedString(Class2, params) {
    return new Class2({
      type: "string",
      coerce: true,
      ...normalizeParams(params)
    });
  }
  function _email(Class2, params) {
    return new Class2({
      type: "string",
      format: "email",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _guid(Class2, params) {
    return new Class2({
      type: "string",
      format: "guid",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _uuid(Class2, params) {
    return new Class2({
      type: "string",
      format: "uuid",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _uuidv4(Class2, params) {
    return new Class2({
      type: "string",
      format: "uuid",
      check: "string_format",
      abort: false,
      version: "v4",
      ...normalizeParams(params)
    });
  }
  function _uuidv6(Class2, params) {
    return new Class2({
      type: "string",
      format: "uuid",
      check: "string_format",
      abort: false,
      version: "v6",
      ...normalizeParams(params)
    });
  }
  function _uuidv7(Class2, params) {
    return new Class2({
      type: "string",
      format: "uuid",
      check: "string_format",
      abort: false,
      version: "v7",
      ...normalizeParams(params)
    });
  }
  function _url(Class2, params) {
    return new Class2({
      type: "string",
      format: "url",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _emoji2(Class2, params) {
    return new Class2({
      type: "string",
      format: "emoji",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _nanoid(Class2, params) {
    return new Class2({
      type: "string",
      format: "nanoid",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _cuid(Class2, params) {
    return new Class2({
      type: "string",
      format: "cuid",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _cuid2(Class2, params) {
    return new Class2({
      type: "string",
      format: "cuid2",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _ulid(Class2, params) {
    return new Class2({
      type: "string",
      format: "ulid",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _xid(Class2, params) {
    return new Class2({
      type: "string",
      format: "xid",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _ksuid(Class2, params) {
    return new Class2({
      type: "string",
      format: "ksuid",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _ipv4(Class2, params) {
    return new Class2({
      type: "string",
      format: "ipv4",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _ipv6(Class2, params) {
    return new Class2({
      type: "string",
      format: "ipv6",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _mac(Class2, params) {
    return new Class2({
      type: "string",
      format: "mac",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _cidrv4(Class2, params) {
    return new Class2({
      type: "string",
      format: "cidrv4",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _cidrv6(Class2, params) {
    return new Class2({
      type: "string",
      format: "cidrv6",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _base64(Class2, params) {
    return new Class2({
      type: "string",
      format: "base64",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _base64url(Class2, params) {
    return new Class2({
      type: "string",
      format: "base64url",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _e164(Class2, params) {
    return new Class2({
      type: "string",
      format: "e164",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  function _jwt(Class2, params) {
    return new Class2({
      type: "string",
      format: "jwt",
      check: "string_format",
      abort: false,
      ...normalizeParams(params)
    });
  }
  var TimePrecision = {
    Any: null,
    Minute: -1,
    Second: 0,
    Millisecond: 3,
    Microsecond: 6
  };
  function _isoDateTime(Class2, params) {
    return new Class2({
      type: "string",
      format: "datetime",
      check: "string_format",
      offset: false,
      local: false,
      precision: null,
      ...normalizeParams(params)
    });
  }
  function _isoDate(Class2, params) {
    return new Class2({
      type: "string",
      format: "date",
      check: "string_format",
      ...normalizeParams(params)
    });
  }
  function _isoTime(Class2, params) {
    return new Class2({
      type: "string",
      format: "time",
      check: "string_format",
      precision: null,
      ...normalizeParams(params)
    });
  }
  function _isoDuration(Class2, params) {
    return new Class2({
      type: "string",
      format: "duration",
      check: "string_format",
      ...normalizeParams(params)
    });
  }
  function _number(Class2, params) {
    return new Class2({
      type: "number",
      checks: [],
      ...normalizeParams(params)
    });
  }
  function _coercedNumber(Class2, params) {
    return new Class2({
      type: "number",
      coerce: true,
      checks: [],
      ...normalizeParams(params)
    });
  }
  function _int(Class2, params) {
    return new Class2({
      type: "number",
      check: "number_format",
      abort: false,
      format: "safeint",
      ...normalizeParams(params)
    });
  }
  function _float32(Class2, params) {
    return new Class2({
      type: "number",
      check: "number_format",
      abort: false,
      format: "float32",
      ...normalizeParams(params)
    });
  }
  function _float64(Class2, params) {
    return new Class2({
      type: "number",
      check: "number_format",
      abort: false,
      format: "float64",
      ...normalizeParams(params)
    });
  }
  function _int32(Class2, params) {
    return new Class2({
      type: "number",
      check: "number_format",
      abort: false,
      format: "int32",
      ...normalizeParams(params)
    });
  }
  function _uint32(Class2, params) {
    return new Class2({
      type: "number",
      check: "number_format",
      abort: false,
      format: "uint32",
      ...normalizeParams(params)
    });
  }
  function _boolean(Class2, params) {
    return new Class2({
      type: "boolean",
      ...normalizeParams(params)
    });
  }
  function _coercedBoolean(Class2, params) {
    return new Class2({
      type: "boolean",
      coerce: true,
      ...normalizeParams(params)
    });
  }
  function _bigint(Class2, params) {
    return new Class2({
      type: "bigint",
      ...normalizeParams(params)
    });
  }
  function _coercedBigint(Class2, params) {
    return new Class2({
      type: "bigint",
      coerce: true,
      ...normalizeParams(params)
    });
  }
  function _int64(Class2, params) {
    return new Class2({
      type: "bigint",
      check: "bigint_format",
      abort: false,
      format: "int64",
      ...normalizeParams(params)
    });
  }
  function _uint64(Class2, params) {
    return new Class2({
      type: "bigint",
      check: "bigint_format",
      abort: false,
      format: "uint64",
      ...normalizeParams(params)
    });
  }
  function _symbol(Class2, params) {
    return new Class2({
      type: "symbol",
      ...normalizeParams(params)
    });
  }
  function _undefined2(Class2, params) {
    return new Class2({
      type: "undefined",
      ...normalizeParams(params)
    });
  }
  function _null2(Class2, params) {
    return new Class2({
      type: "null",
      ...normalizeParams(params)
    });
  }
  function _any(Class2) {
    return new Class2({
      type: "any"
    });
  }
  function _unknown(Class2) {
    return new Class2({
      type: "unknown"
    });
  }
  function _never(Class2, params) {
    return new Class2({
      type: "never",
      ...normalizeParams(params)
    });
  }
  function _void(Class2, params) {
    return new Class2({
      type: "void",
      ...normalizeParams(params)
    });
  }
  function _date(Class2, params) {
    return new Class2({
      type: "date",
      ...normalizeParams(params)
    });
  }
  function _coercedDate(Class2, params) {
    return new Class2({
      type: "date",
      coerce: true,
      ...normalizeParams(params)
    });
  }
  function _nan(Class2, params) {
    return new Class2({
      type: "nan",
      ...normalizeParams(params)
    });
  }
  function _lt(value, params) {
    return new $ZodCheckLessThan({
      check: "less_than",
      ...normalizeParams(params),
      value,
      inclusive: false
    });
  }
  function _lte(value, params) {
    return new $ZodCheckLessThan({
      check: "less_than",
      ...normalizeParams(params),
      value,
      inclusive: true
    });
  }
  function _gt(value, params) {
    return new $ZodCheckGreaterThan({
      check: "greater_than",
      ...normalizeParams(params),
      value,
      inclusive: false
    });
  }
  function _gte(value, params) {
    return new $ZodCheckGreaterThan({
      check: "greater_than",
      ...normalizeParams(params),
      value,
      inclusive: true
    });
  }
  function _positive(params) {
    return _gt(0, params);
  }
  function _negative(params) {
    return _lt(0, params);
  }
  function _nonpositive(params) {
    return _lte(0, params);
  }
  function _nonnegative(params) {
    return _gte(0, params);
  }
  function _multipleOf(value, params) {
    return new $ZodCheckMultipleOf({
      check: "multiple_of",
      ...normalizeParams(params),
      value
    });
  }
  function _maxSize(maximum, params) {
    return new $ZodCheckMaxSize({
      check: "max_size",
      ...normalizeParams(params),
      maximum
    });
  }
  function _minSize(minimum, params) {
    return new $ZodCheckMinSize({
      check: "min_size",
      ...normalizeParams(params),
      minimum
    });
  }
  function _size(size, params) {
    return new $ZodCheckSizeEquals({
      check: "size_equals",
      ...normalizeParams(params),
      size
    });
  }
  function _maxLength(maximum, params) {
    const ch = new $ZodCheckMaxLength({
      check: "max_length",
      ...normalizeParams(params),
      maximum
    });
    return ch;
  }
  function _minLength(minimum, params) {
    return new $ZodCheckMinLength({
      check: "min_length",
      ...normalizeParams(params),
      minimum
    });
  }
  function _length(length, params) {
    return new $ZodCheckLengthEquals({
      check: "length_equals",
      ...normalizeParams(params),
      length
    });
  }
  function _regex(pattern, params) {
    return new $ZodCheckRegex({
      check: "string_format",
      format: "regex",
      ...normalizeParams(params),
      pattern
    });
  }
  function _lowercase(params) {
    return new $ZodCheckLowerCase({
      check: "string_format",
      format: "lowercase",
      ...normalizeParams(params)
    });
  }
  function _uppercase(params) {
    return new $ZodCheckUpperCase({
      check: "string_format",
      format: "uppercase",
      ...normalizeParams(params)
    });
  }
  function _includes(includes, params) {
    return new $ZodCheckIncludes({
      check: "string_format",
      format: "includes",
      ...normalizeParams(params),
      includes
    });
  }
  function _startsWith(prefix, params) {
    return new $ZodCheckStartsWith({
      check: "string_format",
      format: "starts_with",
      ...normalizeParams(params),
      prefix
    });
  }
  function _endsWith(suffix, params) {
    return new $ZodCheckEndsWith({
      check: "string_format",
      format: "ends_with",
      ...normalizeParams(params),
      suffix
    });
  }
  function _property(property, schema, params) {
    return new $ZodCheckProperty({
      check: "property",
      property,
      schema,
      ...normalizeParams(params)
    });
  }
  function _mime(types, params) {
    return new $ZodCheckMimeType({
      check: "mime_type",
      mime: types,
      ...normalizeParams(params)
    });
  }
  function _overwrite(tx) {
    return new $ZodCheckOverwrite({
      check: "overwrite",
      tx
    });
  }
  function _normalize(form) {
    return _overwrite((input) => input.normalize(form));
  }
  function _trim() {
    return _overwrite((input) => input.trim());
  }
  function _toLowerCase() {
    return _overwrite((input) => input.toLowerCase());
  }
  function _toUpperCase() {
    return _overwrite((input) => input.toUpperCase());
  }
  function _slugify() {
    return _overwrite((input) => slugify(input));
  }
  function _array(Class2, element, params) {
    return new Class2({
      type: "array",
      element,
      // get element() {
      //   return element;
      // },
      ...normalizeParams(params)
    });
  }
  function _union(Class2, options, params) {
    return new Class2({
      type: "union",
      options,
      ...normalizeParams(params)
    });
  }
  function _xor(Class2, options, params) {
    return new Class2({
      type: "union",
      options,
      inclusive: false,
      ...normalizeParams(params)
    });
  }
  function _discriminatedUnion(Class2, discriminator, options, params) {
    return new Class2({
      type: "union",
      options,
      discriminator,
      ...normalizeParams(params)
    });
  }
  function _intersection(Class2, left, right) {
    return new Class2({
      type: "intersection",
      left,
      right
    });
  }
  function _tuple(Class2, items, _paramsOrRest, _params) {
    const hasRest = _paramsOrRest instanceof $ZodType;
    const params = hasRest ? _params : _paramsOrRest;
    const rest = hasRest ? _paramsOrRest : null;
    return new Class2({
      type: "tuple",
      items,
      rest,
      ...normalizeParams(params)
    });
  }
  function _record(Class2, keyType, valueType, params) {
    return new Class2({
      type: "record",
      keyType,
      valueType,
      ...normalizeParams(params)
    });
  }
  function _map(Class2, keyType, valueType, params) {
    return new Class2({
      type: "map",
      keyType,
      valueType,
      ...normalizeParams(params)
    });
  }
  function _set(Class2, valueType, params) {
    return new Class2({
      type: "set",
      valueType,
      ...normalizeParams(params)
    });
  }
  function _enum(Class2, values, params) {
    const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
    return new Class2({
      type: "enum",
      entries,
      ...normalizeParams(params)
    });
  }
  function _nativeEnum(Class2, entries, params) {
    return new Class2({
      type: "enum",
      entries,
      ...normalizeParams(params)
    });
  }
  function _literal(Class2, value, params) {
    return new Class2({
      type: "literal",
      values: Array.isArray(value) ? value : [value],
      ...normalizeParams(params)
    });
  }
  function _file(Class2, params) {
    return new Class2({
      type: "file",
      ...normalizeParams(params)
    });
  }
  function _transform(Class2, fn) {
    return new Class2({
      type: "transform",
      transform: fn
    });
  }
  function _optional(Class2, innerType) {
    return new Class2({
      type: "optional",
      innerType
    });
  }
  function _nullable(Class2, innerType) {
    return new Class2({
      type: "nullable",
      innerType
    });
  }
  function _default(Class2, innerType, defaultValue) {
    return new Class2({
      type: "default",
      innerType,
      get defaultValue() {
        return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
      }
    });
  }
  function _nonoptional(Class2, innerType, params) {
    return new Class2({
      type: "nonoptional",
      innerType,
      ...normalizeParams(params)
    });
  }
  function _success(Class2, innerType) {
    return new Class2({
      type: "success",
      innerType
    });
  }
  function _catch(Class2, innerType, catchValue) {
    return new Class2({
      type: "catch",
      innerType,
      catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
    });
  }
  function _pipe(Class2, in_, out) {
    return new Class2({
      type: "pipe",
      in: in_,
      out
    });
  }
  function _readonly(Class2, innerType) {
    return new Class2({
      type: "readonly",
      innerType
    });
  }
  function _templateLiteral(Class2, parts, params) {
    return new Class2({
      type: "template_literal",
      parts,
      ...normalizeParams(params)
    });
  }
  function _lazy(Class2, getter) {
    return new Class2({
      type: "lazy",
      getter
    });
  }
  function _promise(Class2, innerType) {
    return new Class2({
      type: "promise",
      innerType
    });
  }
  function _custom(Class2, fn, _params) {
    const norm = normalizeParams(_params);
    norm.abort ?? (norm.abort = true);
    const schema = new Class2({
      type: "custom",
      check: "custom",
      fn,
      ...norm
    });
    return schema;
  }
  function _refine(Class2, fn, _params) {
    const schema = new Class2({
      type: "custom",
      check: "custom",
      fn,
      ...normalizeParams(_params)
    });
    return schema;
  }
  function _superRefine(fn) {
    const ch = _check((payload) => {
      payload.addIssue = (issue2) => {
        if (typeof issue2 === "string") {
          payload.issues.push(issue(issue2, payload.value, ch._zod.def));
        } else {
          const _issue = issue2;
          if (_issue.fatal)
            _issue.continue = false;
          _issue.code ?? (_issue.code = "custom");
          _issue.input ?? (_issue.input = payload.value);
          _issue.inst ?? (_issue.inst = ch);
          _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
          payload.issues.push(issue(_issue));
        }
      };
      return fn(payload.value, payload);
    });
    return ch;
  }
  function _check(fn, params) {
    const ch = new $ZodCheck({
      check: "custom",
      ...normalizeParams(params)
    });
    ch._zod.check = fn;
    return ch;
  }
  function describe(description) {
    const ch = new $ZodCheck({ check: "describe" });
    ch._zod.onattach = [
      (inst) => {
        const existing = globalRegistry.get(inst) ?? {};
        globalRegistry.add(inst, { ...existing, description });
      }
    ];
    ch._zod.check = () => {
    };
    return ch;
  }
  function meta(metadata) {
    const ch = new $ZodCheck({ check: "meta" });
    ch._zod.onattach = [
      (inst) => {
        const existing = globalRegistry.get(inst) ?? {};
        globalRegistry.add(inst, { ...existing, ...metadata });
      }
    ];
    ch._zod.check = () => {
    };
    return ch;
  }
  function _stringbool(Classes, _params) {
    const params = normalizeParams(_params);
    let truthyArray = params.truthy ?? ["true", "1", "yes", "on", "y", "enabled"];
    let falsyArray = params.falsy ?? ["false", "0", "no", "off", "n", "disabled"];
    if (params.case !== "sensitive") {
      truthyArray = truthyArray.map((v) => typeof v === "string" ? v.toLowerCase() : v);
      falsyArray = falsyArray.map((v) => typeof v === "string" ? v.toLowerCase() : v);
    }
    const truthySet = new Set(truthyArray);
    const falsySet = new Set(falsyArray);
    const _Codec = Classes.Codec ?? $ZodCodec;
    const _Boolean = Classes.Boolean ?? $ZodBoolean;
    const _String = Classes.String ?? $ZodString;
    const stringSchema = new _String({ type: "string", error: params.error });
    const booleanSchema = new _Boolean({ type: "boolean", error: params.error });
    const codec2 = new _Codec({
      type: "pipe",
      in: stringSchema,
      out: booleanSchema,
      transform: ((input, payload) => {
        let data = input;
        if (params.case !== "sensitive")
          data = data.toLowerCase();
        if (truthySet.has(data)) {
          return true;
        } else if (falsySet.has(data)) {
          return false;
        } else {
          payload.issues.push({
            code: "invalid_value",
            expected: "stringbool",
            values: [...truthySet, ...falsySet],
            input: payload.value,
            inst: codec2,
            continue: false
          });
          return {};
        }
      }),
      reverseTransform: ((input, _payload) => {
        if (input === true) {
          return truthyArray[0] || "true";
        } else {
          return falsyArray[0] || "false";
        }
      }),
      error: params.error
    });
    return codec2;
  }
  function _stringFormat(Class2, format, fnOrRegex, _params = {}) {
    const params = normalizeParams(_params);
    const def = {
      ...normalizeParams(_params),
      check: "string_format",
      type: "string",
      format,
      fn: typeof fnOrRegex === "function" ? fnOrRegex : (val) => fnOrRegex.test(val),
      ...params
    };
    if (fnOrRegex instanceof RegExp) {
      def.pattern = fnOrRegex;
    }
    const inst = new Class2(def);
    return inst;
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/to-json-schema.js
  function initializeContext(params) {
    let target = params?.target ?? "draft-2020-12";
    if (target === "draft-4")
      target = "draft-04";
    if (target === "draft-7")
      target = "draft-07";
    return {
      processors: params.processors ?? {},
      metadataRegistry: params?.metadata ?? globalRegistry,
      target,
      unrepresentable: params?.unrepresentable ?? "throw",
      override: params?.override ?? (() => {
      }),
      io: params?.io ?? "output",
      counter: 0,
      seen: /* @__PURE__ */ new Map(),
      cycles: params?.cycles ?? "ref",
      reused: params?.reused ?? "inline",
      external: params?.external ?? void 0
    };
  }
  function process(schema, ctx, _params = { path: [], schemaPath: [] }) {
    var _a2;
    const def = schema._zod.def;
    const seen = ctx.seen.get(schema);
    if (seen) {
      seen.count++;
      const isCycle = _params.schemaPath.includes(schema);
      if (isCycle) {
        seen.cycle = _params.path;
      }
      return seen.schema;
    }
    const result = { schema: {}, count: 1, cycle: void 0, path: _params.path };
    ctx.seen.set(schema, result);
    const overrideSchema = schema._zod.toJSONSchema?.();
    if (overrideSchema) {
      result.schema = overrideSchema;
    } else {
      const params = {
        ..._params,
        schemaPath: [..._params.schemaPath, schema],
        path: _params.path
      };
      const parent = schema._zod.parent;
      if (parent) {
        result.ref = parent;
        process(parent, ctx, params);
        ctx.seen.get(parent).isParent = true;
      } else if (schema._zod.processJSONSchema) {
        schema._zod.processJSONSchema(ctx, result.schema, params);
      } else {
        const _json = result.schema;
        const processor = ctx.processors[def.type];
        if (!processor) {
          throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
        }
        processor(schema, ctx, _json, params);
      }
    }
    const meta3 = ctx.metadataRegistry.get(schema);
    if (meta3)
      Object.assign(result.schema, meta3);
    if (ctx.io === "input" && isTransforming(schema)) {
      delete result.schema.examples;
      delete result.schema.default;
    }
    if (ctx.io === "input" && result.schema._prefault)
      (_a2 = result.schema).default ?? (_a2.default = result.schema._prefault);
    delete result.schema._prefault;
    const _result = ctx.seen.get(schema);
    return _result.schema;
  }
  function extractDefs(ctx, schema) {
    const root = ctx.seen.get(schema);
    if (!root)
      throw new Error("Unprocessed schema. This is a bug in Zod.");
    const makeURI = (entry) => {
      const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
      if (ctx.external) {
        const externalId = ctx.external.registry.get(entry[0])?.id;
        const uriGenerator = ctx.external.uri ?? ((id2) => id2);
        if (externalId) {
          return { ref: uriGenerator(externalId) };
        }
        const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
        entry[1].defId = id;
        return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}` };
      }
      if (entry[1] === root) {
        return { ref: "#" };
      }
      const uriPrefix = `#`;
      const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
      const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
      return { defId, ref: defUriPrefix + defId };
    };
    const extractToDef = (entry) => {
      if (entry[1].schema.$ref) {
        return;
      }
      const seen = entry[1];
      const { ref, defId } = makeURI(entry);
      seen.def = { ...seen.schema };
      if (defId)
        seen.defId = defId;
      const schema2 = seen.schema;
      for (const key in schema2) {
        delete schema2[key];
      }
      schema2.$ref = ref;
    };
    if (ctx.cycles === "throw") {
      for (const entry of ctx.seen.entries()) {
        const seen = entry[1];
        if (seen.cycle) {
          throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
        }
      }
    }
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (schema === entry[0]) {
        extractToDef(entry);
        continue;
      }
      if (ctx.external) {
        const ext = ctx.external.registry.get(entry[0])?.id;
        if (schema !== entry[0] && ext) {
          extractToDef(entry);
          continue;
        }
      }
      const id = ctx.metadataRegistry.get(entry[0])?.id;
      if (id) {
        extractToDef(entry);
        continue;
      }
      if (seen.cycle) {
        extractToDef(entry);
        continue;
      }
      if (seen.count > 1) {
        if (ctx.reused === "ref") {
          extractToDef(entry);
          continue;
        }
      }
    }
  }
  function finalize(ctx, schema) {
    const root = ctx.seen.get(schema);
    if (!root)
      throw new Error("Unprocessed schema. This is a bug in Zod.");
    const flattenRef = (zodSchema) => {
      const seen = ctx.seen.get(zodSchema);
      const schema2 = seen.def ?? seen.schema;
      const _cached = { ...schema2 };
      if (seen.ref === null) {
        return;
      }
      const ref = seen.ref;
      seen.ref = null;
      if (ref) {
        flattenRef(ref);
        const refSchema = ctx.seen.get(ref).schema;
        if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
          schema2.allOf = schema2.allOf ?? [];
          schema2.allOf.push(refSchema);
        } else {
          Object.assign(schema2, refSchema);
          Object.assign(schema2, _cached);
        }
      }
      if (!seen.isParent)
        ctx.override({
          zodSchema,
          jsonSchema: schema2,
          path: seen.path ?? []
        });
    };
    for (const entry of [...ctx.seen.entries()].reverse()) {
      flattenRef(entry[0]);
    }
    const result = {};
    if (ctx.target === "draft-2020-12") {
      result.$schema = "https://json-schema.org/draft/2020-12/schema";
    } else if (ctx.target === "draft-07") {
      result.$schema = "http://json-schema.org/draft-07/schema#";
    } else if (ctx.target === "draft-04") {
      result.$schema = "http://json-schema.org/draft-04/schema#";
    } else if (ctx.target === "openapi-3.0") {
    } else {
    }
    if (ctx.external?.uri) {
      const id = ctx.external.registry.get(schema)?.id;
      if (!id)
        throw new Error("Schema is missing an `id` property");
      result.$id = ctx.external.uri(id);
    }
    Object.assign(result, root.def ?? root.schema);
    const defs = ctx.external?.defs ?? {};
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.def && seen.defId) {
        defs[seen.defId] = seen.def;
      }
    }
    if (ctx.external) {
    } else {
      if (Object.keys(defs).length > 0) {
        if (ctx.target === "draft-2020-12") {
          result.$defs = defs;
        } else {
          result.definitions = defs;
        }
      }
    }
    try {
      const finalized = JSON.parse(JSON.stringify(result));
      Object.defineProperty(finalized, "~standard", {
        value: {
          ...schema["~standard"],
          jsonSchema: {
            input: createStandardJSONSchemaMethod(schema, "input"),
            output: createStandardJSONSchemaMethod(schema, "output")
          }
        },
        enumerable: false,
        writable: false
      });
      return finalized;
    } catch (_err) {
      throw new Error("Error converting schema to JSON.");
    }
  }
  function isTransforming(_schema, _ctx) {
    const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
    if (ctx.seen.has(_schema))
      return false;
    ctx.seen.add(_schema);
    const def = _schema._zod.def;
    if (def.type === "transform")
      return true;
    if (def.type === "array")
      return isTransforming(def.element, ctx);
    if (def.type === "set")
      return isTransforming(def.valueType, ctx);
    if (def.type === "lazy")
      return isTransforming(def.getter(), ctx);
    if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") {
      return isTransforming(def.innerType, ctx);
    }
    if (def.type === "intersection") {
      return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
    }
    if (def.type === "record" || def.type === "map") {
      return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
    }
    if (def.type === "pipe") {
      return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
    }
    if (def.type === "object") {
      for (const key in def.shape) {
        if (isTransforming(def.shape[key], ctx))
          return true;
      }
      return false;
    }
    if (def.type === "union") {
      for (const option of def.options) {
        if (isTransforming(option, ctx))
          return true;
      }
      return false;
    }
    if (def.type === "tuple") {
      for (const item of def.items) {
        if (isTransforming(item, ctx))
          return true;
      }
      if (def.rest && isTransforming(def.rest, ctx))
        return true;
      return false;
    }
    return false;
  }
  var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
    const ctx = initializeContext({ ...params, processors });
    process(schema, ctx);
    extractDefs(ctx, schema);
    return finalize(ctx, schema);
  };
  var createStandardJSONSchemaMethod = (schema, io) => (params) => {
    const { libraryOptions, target } = params ?? {};
    const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors: {} });
    process(schema, ctx);
    extractDefs(ctx, schema);
    return finalize(ctx, schema);
  };

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/json-schema-processors.js
  var formatMap = {
    guid: "uuid",
    url: "uri",
    datetime: "date-time",
    json_string: "json-string",
    regex: ""
    // do not set
  };
  var stringProcessor = (schema, ctx, _json, _params) => {
    const json2 = _json;
    json2.type = "string";
    const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
    if (typeof minimum === "number")
      json2.minLength = minimum;
    if (typeof maximum === "number")
      json2.maxLength = maximum;
    if (format) {
      json2.format = formatMap[format] ?? format;
      if (json2.format === "")
        delete json2.format;
    }
    if (contentEncoding)
      json2.contentEncoding = contentEncoding;
    if (patterns && patterns.size > 0) {
      const regexes = [...patterns];
      if (regexes.length === 1)
        json2.pattern = regexes[0].source;
      else if (regexes.length > 1) {
        json2.allOf = [
          ...regexes.map((regex) => ({
            ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
            pattern: regex.source
          }))
        ];
      }
    }
  };
  var numberProcessor = (schema, ctx, _json, _params) => {
    const json2 = _json;
    const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
    if (typeof format === "string" && format.includes("int"))
      json2.type = "integer";
    else
      json2.type = "number";
    if (typeof exclusiveMinimum === "number") {
      if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
        json2.minimum = exclusiveMinimum;
        json2.exclusiveMinimum = true;
      } else {
        json2.exclusiveMinimum = exclusiveMinimum;
      }
    }
    if (typeof minimum === "number") {
      json2.minimum = minimum;
      if (typeof exclusiveMinimum === "number" && ctx.target !== "draft-04") {
        if (exclusiveMinimum >= minimum)
          delete json2.minimum;
        else
          delete json2.exclusiveMinimum;
      }
    }
    if (typeof exclusiveMaximum === "number") {
      if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
        json2.maximum = exclusiveMaximum;
        json2.exclusiveMaximum = true;
      } else {
        json2.exclusiveMaximum = exclusiveMaximum;
      }
    }
    if (typeof maximum === "number") {
      json2.maximum = maximum;
      if (typeof exclusiveMaximum === "number" && ctx.target !== "draft-04") {
        if (exclusiveMaximum <= maximum)
          delete json2.maximum;
        else
          delete json2.exclusiveMaximum;
      }
    }
    if (typeof multipleOf === "number")
      json2.multipleOf = multipleOf;
  };
  var booleanProcessor = (_schema, _ctx, json2, _params) => {
    json2.type = "boolean";
  };
  var bigintProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
      throw new Error("BigInt cannot be represented in JSON Schema");
    }
  };
  var symbolProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
      throw new Error("Symbols cannot be represented in JSON Schema");
    }
  };
  var nullProcessor = (_schema, ctx, json2, _params) => {
    if (ctx.target === "openapi-3.0") {
      json2.type = "string";
      json2.nullable = true;
      json2.enum = [null];
    } else {
      json2.type = "null";
    }
  };
  var undefinedProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
      throw new Error("Undefined cannot be represented in JSON Schema");
    }
  };
  var voidProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
      throw new Error("Void cannot be represented in JSON Schema");
    }
  };
  var neverProcessor = (_schema, _ctx, json2, _params) => {
    json2.not = {};
  };
  var anyProcessor = (_schema, _ctx, _json, _params) => {
  };
  var unknownProcessor = (_schema, _ctx, _json, _params) => {
  };
  var dateProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
      throw new Error("Date cannot be represented in JSON Schema");
    }
  };
  var enumProcessor = (schema, _ctx, json2, _params) => {
    const def = schema._zod.def;
    const values = getEnumValues(def.entries);
    if (values.every((v) => typeof v === "number"))
      json2.type = "number";
    if (values.every((v) => typeof v === "string"))
      json2.type = "string";
    json2.enum = values;
  };
  var literalProcessor = (schema, ctx, json2, _params) => {
    const def = schema._zod.def;
    const vals = [];
    for (const val of def.values) {
      if (val === void 0) {
        if (ctx.unrepresentable === "throw") {
          throw new Error("Literal `undefined` cannot be represented in JSON Schema");
        } else {
        }
      } else if (typeof val === "bigint") {
        if (ctx.unrepresentable === "throw") {
          throw new Error("BigInt literals cannot be represented in JSON Schema");
        } else {
          vals.push(Number(val));
        }
      } else {
        vals.push(val);
      }
    }
    if (vals.length === 0) {
    } else if (vals.length === 1) {
      const val = vals[0];
      json2.type = val === null ? "null" : typeof val;
      if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
        json2.enum = [val];
      } else {
        json2.const = val;
      }
    } else {
      if (vals.every((v) => typeof v === "number"))
        json2.type = "number";
      if (vals.every((v) => typeof v === "string"))
        json2.type = "string";
      if (vals.every((v) => typeof v === "boolean"))
        json2.type = "boolean";
      if (vals.every((v) => v === null))
        json2.type = "null";
      json2.enum = vals;
    }
  };
  var nanProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
      throw new Error("NaN cannot be represented in JSON Schema");
    }
  };
  var templateLiteralProcessor = (schema, _ctx, json2, _params) => {
    const _json = json2;
    const pattern = schema._zod.pattern;
    if (!pattern)
      throw new Error("Pattern not found in template literal");
    _json.type = "string";
    _json.pattern = pattern.source;
  };
  var fileProcessor = (schema, _ctx, json2, _params) => {
    const _json = json2;
    const file2 = {
      type: "string",
      format: "binary",
      contentEncoding: "binary"
    };
    const { minimum, maximum, mime } = schema._zod.bag;
    if (minimum !== void 0)
      file2.minLength = minimum;
    if (maximum !== void 0)
      file2.maxLength = maximum;
    if (mime) {
      if (mime.length === 1) {
        file2.contentMediaType = mime[0];
        Object.assign(_json, file2);
      } else {
        _json.anyOf = mime.map((m) => {
          const mFile = { ...file2, contentMediaType: m };
          return mFile;
        });
      }
    } else {
      Object.assign(_json, file2);
    }
  };
  var successProcessor = (_schema, _ctx, json2, _params) => {
    json2.type = "boolean";
  };
  var customProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
      throw new Error("Custom types cannot be represented in JSON Schema");
    }
  };
  var functionProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
      throw new Error("Function types cannot be represented in JSON Schema");
    }
  };
  var transformProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
      throw new Error("Transforms cannot be represented in JSON Schema");
    }
  };
  var mapProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
      throw new Error("Map cannot be represented in JSON Schema");
    }
  };
  var setProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
      throw new Error("Set cannot be represented in JSON Schema");
    }
  };
  var arrayProcessor = (schema, ctx, _json, params) => {
    const json2 = _json;
    const def = schema._zod.def;
    const { minimum, maximum } = schema._zod.bag;
    if (typeof minimum === "number")
      json2.minItems = minimum;
    if (typeof maximum === "number")
      json2.maxItems = maximum;
    json2.type = "array";
    json2.items = process(def.element, ctx, { ...params, path: [...params.path, "items"] });
  };
  var objectProcessor = (schema, ctx, _json, params) => {
    const json2 = _json;
    const def = schema._zod.def;
    json2.type = "object";
    json2.properties = {};
    const shape = def.shape;
    for (const key in shape) {
      json2.properties[key] = process(shape[key], ctx, {
        ...params,
        path: [...params.path, "properties", key]
      });
    }
    const allKeys = new Set(Object.keys(shape));
    const requiredKeys = new Set([...allKeys].filter((key) => {
      const v = def.shape[key]._zod;
      if (ctx.io === "input") {
        return v.optin === void 0;
      } else {
        return v.optout === void 0;
      }
    }));
    if (requiredKeys.size > 0) {
      json2.required = Array.from(requiredKeys);
    }
    if (def.catchall?._zod.def.type === "never") {
      json2.additionalProperties = false;
    } else if (!def.catchall) {
      if (ctx.io === "output")
        json2.additionalProperties = false;
    } else if (def.catchall) {
      json2.additionalProperties = process(def.catchall, ctx, {
        ...params,
        path: [...params.path, "additionalProperties"]
      });
    }
  };
  var unionProcessor = (schema, ctx, json2, params) => {
    const def = schema._zod.def;
    const isExclusive = def.inclusive === false;
    const options = def.options.map((x, i) => process(x, ctx, {
      ...params,
      path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
    }));
    if (isExclusive) {
      json2.oneOf = options;
    } else {
      json2.anyOf = options;
    }
  };
  var intersectionProcessor = (schema, ctx, json2, params) => {
    const def = schema._zod.def;
    const a = process(def.left, ctx, {
      ...params,
      path: [...params.path, "allOf", 0]
    });
    const b = process(def.right, ctx, {
      ...params,
      path: [...params.path, "allOf", 1]
    });
    const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
    const allOf = [
      ...isSimpleIntersection(a) ? a.allOf : [a],
      ...isSimpleIntersection(b) ? b.allOf : [b]
    ];
    json2.allOf = allOf;
  };
  var tupleProcessor = (schema, ctx, _json, params) => {
    const json2 = _json;
    const def = schema._zod.def;
    json2.type = "array";
    const prefixPath = ctx.target === "draft-2020-12" ? "prefixItems" : "items";
    const restPath = ctx.target === "draft-2020-12" ? "items" : ctx.target === "openapi-3.0" ? "items" : "additionalItems";
    const prefixItems = def.items.map((x, i) => process(x, ctx, {
      ...params,
      path: [...params.path, prefixPath, i]
    }));
    const rest = def.rest ? process(def.rest, ctx, {
      ...params,
      path: [...params.path, restPath, ...ctx.target === "openapi-3.0" ? [def.items.length] : []]
    }) : null;
    if (ctx.target === "draft-2020-12") {
      json2.prefixItems = prefixItems;
      if (rest) {
        json2.items = rest;
      }
    } else if (ctx.target === "openapi-3.0") {
      json2.items = {
        anyOf: prefixItems
      };
      if (rest) {
        json2.items.anyOf.push(rest);
      }
      json2.minItems = prefixItems.length;
      if (!rest) {
        json2.maxItems = prefixItems.length;
      }
    } else {
      json2.items = prefixItems;
      if (rest) {
        json2.additionalItems = rest;
      }
    }
    const { minimum, maximum } = schema._zod.bag;
    if (typeof minimum === "number")
      json2.minItems = minimum;
    if (typeof maximum === "number")
      json2.maxItems = maximum;
  };
  var recordProcessor = (schema, ctx, _json, params) => {
    const json2 = _json;
    const def = schema._zod.def;
    json2.type = "object";
    if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
      json2.propertyNames = process(def.keyType, ctx, {
        ...params,
        path: [...params.path, "propertyNames"]
      });
    }
    json2.additionalProperties = process(def.valueType, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  };
  var nullableProcessor = (schema, ctx, json2, params) => {
    const def = schema._zod.def;
    const inner = process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    if (ctx.target === "openapi-3.0") {
      seen.ref = def.innerType;
      json2.nullable = true;
    } else {
      json2.anyOf = [inner, { type: "null" }];
    }
  };
  var nonoptionalProcessor = (schema, ctx, _json, params) => {
    const def = schema._zod.def;
    process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
  };
  var defaultProcessor = (schema, ctx, json2, params) => {
    const def = schema._zod.def;
    process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
    json2.default = JSON.parse(JSON.stringify(def.defaultValue));
  };
  var prefaultProcessor = (schema, ctx, json2, params) => {
    const def = schema._zod.def;
    process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
    if (ctx.io === "input")
      json2._prefault = JSON.parse(JSON.stringify(def.defaultValue));
  };
  var catchProcessor = (schema, ctx, json2, params) => {
    const def = schema._zod.def;
    process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
    let catchValue;
    try {
      catchValue = def.catchValue(void 0);
    } catch {
      throw new Error("Dynamic catch values are not supported in JSON Schema");
    }
    json2.default = catchValue;
  };
  var pipeProcessor = (schema, ctx, _json, params) => {
    const def = schema._zod.def;
    const innerType = ctx.io === "input" ? def.in._zod.def.type === "transform" ? def.out : def.in : def.out;
    process(innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = innerType;
  };
  var readonlyProcessor = (schema, ctx, json2, params) => {
    const def = schema._zod.def;
    process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
    json2.readOnly = true;
  };
  var promiseProcessor = (schema, ctx, _json, params) => {
    const def = schema._zod.def;
    process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
  };
  var optionalProcessor = (schema, ctx, _json, params) => {
    const def = schema._zod.def;
    process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
  };
  var lazyProcessor = (schema, ctx, _json, params) => {
    const innerType = schema._zod.innerType;
    process(innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = innerType;
  };
  var allProcessors = {
    string: stringProcessor,
    number: numberProcessor,
    boolean: booleanProcessor,
    bigint: bigintProcessor,
    symbol: symbolProcessor,
    null: nullProcessor,
    undefined: undefinedProcessor,
    void: voidProcessor,
    never: neverProcessor,
    any: anyProcessor,
    unknown: unknownProcessor,
    date: dateProcessor,
    enum: enumProcessor,
    literal: literalProcessor,
    nan: nanProcessor,
    template_literal: templateLiteralProcessor,
    file: fileProcessor,
    success: successProcessor,
    custom: customProcessor,
    function: functionProcessor,
    transform: transformProcessor,
    map: mapProcessor,
    set: setProcessor,
    array: arrayProcessor,
    object: objectProcessor,
    union: unionProcessor,
    intersection: intersectionProcessor,
    tuple: tupleProcessor,
    record: recordProcessor,
    nullable: nullableProcessor,
    nonoptional: nonoptionalProcessor,
    default: defaultProcessor,
    prefault: prefaultProcessor,
    catch: catchProcessor,
    pipe: pipeProcessor,
    readonly: readonlyProcessor,
    promise: promiseProcessor,
    optional: optionalProcessor,
    lazy: lazyProcessor
  };
  function toJSONSchema(input, params) {
    if ("_idmap" in input) {
      const registry2 = input;
      const ctx2 = initializeContext({ ...params, processors: allProcessors });
      const defs = {};
      for (const entry of registry2._idmap.entries()) {
        const [_, schema] = entry;
        process(schema, ctx2);
      }
      const schemas = {};
      const external = {
        registry: registry2,
        uri: params?.uri,
        defs
      };
      ctx2.external = external;
      for (const entry of registry2._idmap.entries()) {
        const [key, schema] = entry;
        extractDefs(ctx2, schema);
        schemas[key] = finalize(ctx2, schema);
      }
      if (Object.keys(defs).length > 0) {
        const defsSegment = ctx2.target === "draft-2020-12" ? "$defs" : "definitions";
        schemas.__shared = {
          [defsSegment]: defs
        };
      }
      return { schemas };
    }
    const ctx = initializeContext({ ...params, processors: allProcessors });
    process(input, ctx);
    extractDefs(ctx, input);
    return finalize(ctx, input);
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/json-schema-generator.js
  var JSONSchemaGenerator = class {
    /** @deprecated Access via ctx instead */
    get metadataRegistry() {
      return this.ctx.metadataRegistry;
    }
    /** @deprecated Access via ctx instead */
    get target() {
      return this.ctx.target;
    }
    /** @deprecated Access via ctx instead */
    get unrepresentable() {
      return this.ctx.unrepresentable;
    }
    /** @deprecated Access via ctx instead */
    get override() {
      return this.ctx.override;
    }
    /** @deprecated Access via ctx instead */
    get io() {
      return this.ctx.io;
    }
    /** @deprecated Access via ctx instead */
    get counter() {
      return this.ctx.counter;
    }
    set counter(value) {
      this.ctx.counter = value;
    }
    /** @deprecated Access via ctx instead */
    get seen() {
      return this.ctx.seen;
    }
    constructor(params) {
      let normalizedTarget = params?.target ?? "draft-2020-12";
      if (normalizedTarget === "draft-4")
        normalizedTarget = "draft-04";
      if (normalizedTarget === "draft-7")
        normalizedTarget = "draft-07";
      this.ctx = initializeContext({
        processors: allProcessors,
        target: normalizedTarget,
        ...params?.metadata && { metadata: params.metadata },
        ...params?.unrepresentable && { unrepresentable: params.unrepresentable },
        ...params?.override && { override: params.override },
        ...params?.io && { io: params.io }
      });
    }
    /**
     * Process a schema to prepare it for JSON Schema generation.
     * This must be called before emit().
     */
    process(schema, _params = { path: [], schemaPath: [] }) {
      return process(schema, this.ctx, _params);
    }
    /**
     * Emit the final JSON Schema after processing.
     * Must call process() first.
     */
    emit(schema, _params) {
      if (_params) {
        if (_params.cycles)
          this.ctx.cycles = _params.cycles;
        if (_params.reused)
          this.ctx.reused = _params.reused;
        if (_params.external)
          this.ctx.external = _params.external;
      }
      extractDefs(this.ctx, schema);
      const result = finalize(this.ctx, schema);
      const { "~standard": _, ...plainResult } = result;
      return plainResult;
    }
  };

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/json-schema.js
  var json_schema_exports = {};

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/schemas.js
  var schemas_exports2 = {};
  __export(schemas_exports2, {
    ZodAny: () => ZodAny,
    ZodArray: () => ZodArray,
    ZodBase64: () => ZodBase64,
    ZodBase64URL: () => ZodBase64URL,
    ZodBigInt: () => ZodBigInt,
    ZodBigIntFormat: () => ZodBigIntFormat,
    ZodBoolean: () => ZodBoolean,
    ZodCIDRv4: () => ZodCIDRv4,
    ZodCIDRv6: () => ZodCIDRv6,
    ZodCUID: () => ZodCUID,
    ZodCUID2: () => ZodCUID2,
    ZodCatch: () => ZodCatch,
    ZodCodec: () => ZodCodec,
    ZodCustom: () => ZodCustom,
    ZodCustomStringFormat: () => ZodCustomStringFormat,
    ZodDate: () => ZodDate,
    ZodDefault: () => ZodDefault,
    ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
    ZodE164: () => ZodE164,
    ZodEmail: () => ZodEmail,
    ZodEmoji: () => ZodEmoji,
    ZodEnum: () => ZodEnum,
    ZodFile: () => ZodFile,
    ZodFunction: () => ZodFunction,
    ZodGUID: () => ZodGUID,
    ZodIPv4: () => ZodIPv4,
    ZodIPv6: () => ZodIPv6,
    ZodIntersection: () => ZodIntersection,
    ZodJWT: () => ZodJWT,
    ZodKSUID: () => ZodKSUID,
    ZodLazy: () => ZodLazy,
    ZodLiteral: () => ZodLiteral,
    ZodMAC: () => ZodMAC,
    ZodMap: () => ZodMap,
    ZodNaN: () => ZodNaN,
    ZodNanoID: () => ZodNanoID,
    ZodNever: () => ZodNever,
    ZodNonOptional: () => ZodNonOptional,
    ZodNull: () => ZodNull,
    ZodNullable: () => ZodNullable,
    ZodNumber: () => ZodNumber,
    ZodNumberFormat: () => ZodNumberFormat,
    ZodObject: () => ZodObject,
    ZodOptional: () => ZodOptional,
    ZodPipe: () => ZodPipe,
    ZodPrefault: () => ZodPrefault,
    ZodPromise: () => ZodPromise,
    ZodReadonly: () => ZodReadonly,
    ZodRecord: () => ZodRecord,
    ZodSet: () => ZodSet,
    ZodString: () => ZodString,
    ZodStringFormat: () => ZodStringFormat,
    ZodSuccess: () => ZodSuccess,
    ZodSymbol: () => ZodSymbol,
    ZodTemplateLiteral: () => ZodTemplateLiteral,
    ZodTransform: () => ZodTransform,
    ZodTuple: () => ZodTuple,
    ZodType: () => ZodType,
    ZodULID: () => ZodULID,
    ZodURL: () => ZodURL,
    ZodUUID: () => ZodUUID,
    ZodUndefined: () => ZodUndefined,
    ZodUnion: () => ZodUnion,
    ZodUnknown: () => ZodUnknown,
    ZodVoid: () => ZodVoid,
    ZodXID: () => ZodXID,
    ZodXor: () => ZodXor,
    _ZodString: () => _ZodString,
    _default: () => _default2,
    _function: () => _function,
    any: () => any,
    array: () => array,
    base64: () => base642,
    base64url: () => base64url2,
    bigint: () => bigint2,
    boolean: () => boolean2,
    catch: () => _catch2,
    check: () => check,
    cidrv4: () => cidrv42,
    cidrv6: () => cidrv62,
    codec: () => codec,
    cuid: () => cuid3,
    cuid2: () => cuid22,
    custom: () => custom,
    date: () => date3,
    describe: () => describe2,
    discriminatedUnion: () => discriminatedUnion,
    e164: () => e1642,
    email: () => email2,
    emoji: () => emoji2,
    enum: () => _enum2,
    file: () => file,
    float32: () => float32,
    float64: () => float64,
    function: () => _function,
    guid: () => guid2,
    hash: () => hash,
    hex: () => hex2,
    hostname: () => hostname2,
    httpUrl: () => httpUrl,
    instanceof: () => _instanceof,
    int: () => int,
    int32: () => int32,
    int64: () => int64,
    intersection: () => intersection,
    ipv4: () => ipv42,
    ipv6: () => ipv62,
    json: () => json,
    jwt: () => jwt,
    keyof: () => keyof,
    ksuid: () => ksuid2,
    lazy: () => lazy,
    literal: () => literal,
    looseObject: () => looseObject,
    looseRecord: () => looseRecord,
    mac: () => mac2,
    map: () => map,
    meta: () => meta2,
    nan: () => nan,
    nanoid: () => nanoid2,
    nativeEnum: () => nativeEnum,
    never: () => never,
    nonoptional: () => nonoptional,
    null: () => _null3,
    nullable: () => nullable,
    nullish: () => nullish2,
    number: () => number2,
    object: () => object,
    optional: () => optional,
    partialRecord: () => partialRecord,
    pipe: () => pipe,
    prefault: () => prefault,
    preprocess: () => preprocess,
    promise: () => promise,
    readonly: () => readonly,
    record: () => record,
    refine: () => refine,
    set: () => set,
    strictObject: () => strictObject,
    string: () => string2,
    stringFormat: () => stringFormat,
    stringbool: () => stringbool,
    success: () => success,
    superRefine: () => superRefine,
    symbol: () => symbol,
    templateLiteral: () => templateLiteral,
    transform: () => transform,
    tuple: () => tuple,
    uint32: () => uint32,
    uint64: () => uint64,
    ulid: () => ulid2,
    undefined: () => _undefined3,
    union: () => union,
    unknown: () => unknown,
    url: () => url,
    uuid: () => uuid2,
    uuidv4: () => uuidv4,
    uuidv6: () => uuidv6,
    uuidv7: () => uuidv7,
    void: () => _void2,
    xid: () => xid2,
    xor: () => xor
  });

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/checks.js
  var checks_exports2 = {};
  __export(checks_exports2, {
    endsWith: () => _endsWith,
    gt: () => _gt,
    gte: () => _gte,
    includes: () => _includes,
    length: () => _length,
    lowercase: () => _lowercase,
    lt: () => _lt,
    lte: () => _lte,
    maxLength: () => _maxLength,
    maxSize: () => _maxSize,
    mime: () => _mime,
    minLength: () => _minLength,
    minSize: () => _minSize,
    multipleOf: () => _multipleOf,
    negative: () => _negative,
    nonnegative: () => _nonnegative,
    nonpositive: () => _nonpositive,
    normalize: () => _normalize,
    overwrite: () => _overwrite,
    positive: () => _positive,
    property: () => _property,
    regex: () => _regex,
    size: () => _size,
    slugify: () => _slugify,
    startsWith: () => _startsWith,
    toLowerCase: () => _toLowerCase,
    toUpperCase: () => _toUpperCase,
    trim: () => _trim,
    uppercase: () => _uppercase
  });

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/iso.js
  var iso_exports = {};
  __export(iso_exports, {
    ZodISODate: () => ZodISODate,
    ZodISODateTime: () => ZodISODateTime,
    ZodISODuration: () => ZodISODuration,
    ZodISOTime: () => ZodISOTime,
    date: () => date2,
    datetime: () => datetime2,
    duration: () => duration2,
    time: () => time2
  });
  var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
    $ZodISODateTime.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function datetime2(params) {
    return _isoDateTime(ZodISODateTime, params);
  }
  var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
    $ZodISODate.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function date2(params) {
    return _isoDate(ZodISODate, params);
  }
  var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
    $ZodISOTime.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function time2(params) {
    return _isoTime(ZodISOTime, params);
  }
  var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
    $ZodISODuration.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function duration2(params) {
    return _isoDuration(ZodISODuration, params);
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/errors.js
  var initializer2 = (inst, issues) => {
    $ZodError.init(inst, issues);
    inst.name = "ZodError";
    Object.defineProperties(inst, {
      format: {
        value: (mapper) => formatError(inst, mapper)
        // enumerable: false,
      },
      flatten: {
        value: (mapper) => flattenError(inst, mapper)
        // enumerable: false,
      },
      addIssue: {
        value: (issue2) => {
          inst.issues.push(issue2);
          inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
        }
        // enumerable: false,
      },
      addIssues: {
        value: (issues2) => {
          inst.issues.push(...issues2);
          inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
        }
        // enumerable: false,
      },
      isEmpty: {
        get() {
          return inst.issues.length === 0;
        }
        // enumerable: false,
      }
    });
  };
  var ZodError = $constructor("ZodError", initializer2);
  var ZodRealError = $constructor("ZodError", initializer2, {
    Parent: Error
  });

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/parse.js
  var parse2 = /* @__PURE__ */ _parse(ZodRealError);
  var parseAsync2 = /* @__PURE__ */ _parseAsync(ZodRealError);
  var safeParse2 = /* @__PURE__ */ _safeParse(ZodRealError);
  var safeParseAsync2 = /* @__PURE__ */ _safeParseAsync(ZodRealError);
  var encode2 = /* @__PURE__ */ _encode(ZodRealError);
  var decode2 = /* @__PURE__ */ _decode(ZodRealError);
  var encodeAsync2 = /* @__PURE__ */ _encodeAsync(ZodRealError);
  var decodeAsync2 = /* @__PURE__ */ _decodeAsync(ZodRealError);
  var safeEncode2 = /* @__PURE__ */ _safeEncode(ZodRealError);
  var safeDecode2 = /* @__PURE__ */ _safeDecode(ZodRealError);
  var safeEncodeAsync2 = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
  var safeDecodeAsync2 = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/schemas.js
  var ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
    $ZodType.init(inst, def);
    Object.assign(inst["~standard"], {
      jsonSchema: {
        input: createStandardJSONSchemaMethod(inst, "input"),
        output: createStandardJSONSchemaMethod(inst, "output")
      }
    });
    inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
    inst.def = def;
    inst.type = def.type;
    Object.defineProperty(inst, "_def", { value: def });
    inst.check = (...checks) => {
      return inst.clone(util_exports.mergeDefs(def, {
        checks: [
          ...def.checks ?? [],
          ...checks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
        ]
      }));
    };
    inst.clone = (def2, params) => clone(inst, def2, params);
    inst.brand = () => inst;
    inst.register = ((reg, meta3) => {
      reg.add(inst, meta3);
      return inst;
    });
    inst.parse = (data, params) => parse2(inst, data, params, { callee: inst.parse });
    inst.safeParse = (data, params) => safeParse2(inst, data, params);
    inst.parseAsync = async (data, params) => parseAsync2(inst, data, params, { callee: inst.parseAsync });
    inst.safeParseAsync = async (data, params) => safeParseAsync2(inst, data, params);
    inst.spa = inst.safeParseAsync;
    inst.encode = (data, params) => encode2(inst, data, params);
    inst.decode = (data, params) => decode2(inst, data, params);
    inst.encodeAsync = async (data, params) => encodeAsync2(inst, data, params);
    inst.decodeAsync = async (data, params) => decodeAsync2(inst, data, params);
    inst.safeEncode = (data, params) => safeEncode2(inst, data, params);
    inst.safeDecode = (data, params) => safeDecode2(inst, data, params);
    inst.safeEncodeAsync = async (data, params) => safeEncodeAsync2(inst, data, params);
    inst.safeDecodeAsync = async (data, params) => safeDecodeAsync2(inst, data, params);
    inst.refine = (check2, params) => inst.check(refine(check2, params));
    inst.superRefine = (refinement) => inst.check(superRefine(refinement));
    inst.overwrite = (fn) => inst.check(_overwrite(fn));
    inst.optional = () => optional(inst);
    inst.nullable = () => nullable(inst);
    inst.nullish = () => optional(nullable(inst));
    inst.nonoptional = (params) => nonoptional(inst, params);
    inst.array = () => array(inst);
    inst.or = (arg) => union([inst, arg]);
    inst.and = (arg) => intersection(inst, arg);
    inst.transform = (tx) => pipe(inst, transform(tx));
    inst.default = (def2) => _default2(inst, def2);
    inst.prefault = (def2) => prefault(inst, def2);
    inst.catch = (params) => _catch2(inst, params);
    inst.pipe = (target) => pipe(inst, target);
    inst.readonly = () => readonly(inst);
    inst.describe = (description) => {
      const cl = inst.clone();
      globalRegistry.add(cl, { description });
      return cl;
    };
    Object.defineProperty(inst, "description", {
      get() {
        return globalRegistry.get(inst)?.description;
      },
      configurable: true
    });
    inst.meta = (...args) => {
      if (args.length === 0) {
        return globalRegistry.get(inst);
      }
      const cl = inst.clone();
      globalRegistry.add(cl, args[0]);
      return cl;
    };
    inst.isOptional = () => inst.safeParse(void 0).success;
    inst.isNullable = () => inst.safeParse(null).success;
    return inst;
  });
  var _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
    $ZodString.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => stringProcessor(inst, ctx, json2, params);
    const bag = inst._zod.bag;
    inst.format = bag.format ?? null;
    inst.minLength = bag.minimum ?? null;
    inst.maxLength = bag.maximum ?? null;
    inst.regex = (...args) => inst.check(_regex(...args));
    inst.includes = (...args) => inst.check(_includes(...args));
    inst.startsWith = (...args) => inst.check(_startsWith(...args));
    inst.endsWith = (...args) => inst.check(_endsWith(...args));
    inst.min = (...args) => inst.check(_minLength(...args));
    inst.max = (...args) => inst.check(_maxLength(...args));
    inst.length = (...args) => inst.check(_length(...args));
    inst.nonempty = (...args) => inst.check(_minLength(1, ...args));
    inst.lowercase = (params) => inst.check(_lowercase(params));
    inst.uppercase = (params) => inst.check(_uppercase(params));
    inst.trim = () => inst.check(_trim());
    inst.normalize = (...args) => inst.check(_normalize(...args));
    inst.toLowerCase = () => inst.check(_toLowerCase());
    inst.toUpperCase = () => inst.check(_toUpperCase());
    inst.slugify = () => inst.check(_slugify());
  });
  var ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
    $ZodString.init(inst, def);
    _ZodString.init(inst, def);
    inst.email = (params) => inst.check(_email(ZodEmail, params));
    inst.url = (params) => inst.check(_url(ZodURL, params));
    inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
    inst.emoji = (params) => inst.check(_emoji2(ZodEmoji, params));
    inst.guid = (params) => inst.check(_guid(ZodGUID, params));
    inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
    inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
    inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
    inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
    inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
    inst.guid = (params) => inst.check(_guid(ZodGUID, params));
    inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
    inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
    inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
    inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
    inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
    inst.xid = (params) => inst.check(_xid(ZodXID, params));
    inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
    inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
    inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
    inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
    inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
    inst.e164 = (params) => inst.check(_e164(ZodE164, params));
    inst.datetime = (params) => inst.check(datetime2(params));
    inst.date = (params) => inst.check(date2(params));
    inst.time = (params) => inst.check(time2(params));
    inst.duration = (params) => inst.check(duration2(params));
  });
  function string2(params) {
    return _string(ZodString, params);
  }
  var ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
    $ZodStringFormat.init(inst, def);
    _ZodString.init(inst, def);
  });
  var ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
    $ZodEmail.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function email2(params) {
    return _email(ZodEmail, params);
  }
  var ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
    $ZodGUID.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function guid2(params) {
    return _guid(ZodGUID, params);
  }
  var ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
    $ZodUUID.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function uuid2(params) {
    return _uuid(ZodUUID, params);
  }
  function uuidv4(params) {
    return _uuidv4(ZodUUID, params);
  }
  function uuidv6(params) {
    return _uuidv6(ZodUUID, params);
  }
  function uuidv7(params) {
    return _uuidv7(ZodUUID, params);
  }
  var ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
    $ZodURL.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function url(params) {
    return _url(ZodURL, params);
  }
  function httpUrl(params) {
    return _url(ZodURL, {
      protocol: /^https?$/,
      hostname: regexes_exports.domain,
      ...util_exports.normalizeParams(params)
    });
  }
  var ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
    $ZodEmoji.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function emoji2(params) {
    return _emoji2(ZodEmoji, params);
  }
  var ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
    $ZodNanoID.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function nanoid2(params) {
    return _nanoid(ZodNanoID, params);
  }
  var ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
    $ZodCUID.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function cuid3(params) {
    return _cuid(ZodCUID, params);
  }
  var ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
    $ZodCUID2.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function cuid22(params) {
    return _cuid2(ZodCUID2, params);
  }
  var ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
    $ZodULID.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function ulid2(params) {
    return _ulid(ZodULID, params);
  }
  var ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
    $ZodXID.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function xid2(params) {
    return _xid(ZodXID, params);
  }
  var ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
    $ZodKSUID.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function ksuid2(params) {
    return _ksuid(ZodKSUID, params);
  }
  var ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
    $ZodIPv4.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function ipv42(params) {
    return _ipv4(ZodIPv4, params);
  }
  var ZodMAC = /* @__PURE__ */ $constructor("ZodMAC", (inst, def) => {
    $ZodMAC.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function mac2(params) {
    return _mac(ZodMAC, params);
  }
  var ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
    $ZodIPv6.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function ipv62(params) {
    return _ipv6(ZodIPv6, params);
  }
  var ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
    $ZodCIDRv4.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function cidrv42(params) {
    return _cidrv4(ZodCIDRv4, params);
  }
  var ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
    $ZodCIDRv6.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function cidrv62(params) {
    return _cidrv6(ZodCIDRv6, params);
  }
  var ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
    $ZodBase64.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function base642(params) {
    return _base64(ZodBase64, params);
  }
  var ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
    $ZodBase64URL.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function base64url2(params) {
    return _base64url(ZodBase64URL, params);
  }
  var ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
    $ZodE164.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function e1642(params) {
    return _e164(ZodE164, params);
  }
  var ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
    $ZodJWT.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function jwt(params) {
    return _jwt(ZodJWT, params);
  }
  var ZodCustomStringFormat = /* @__PURE__ */ $constructor("ZodCustomStringFormat", (inst, def) => {
    $ZodCustomStringFormat.init(inst, def);
    ZodStringFormat.init(inst, def);
  });
  function stringFormat(format, fnOrRegex, _params = {}) {
    return _stringFormat(ZodCustomStringFormat, format, fnOrRegex, _params);
  }
  function hostname2(_params) {
    return _stringFormat(ZodCustomStringFormat, "hostname", regexes_exports.hostname, _params);
  }
  function hex2(_params) {
    return _stringFormat(ZodCustomStringFormat, "hex", regexes_exports.hex, _params);
  }
  function hash(alg, params) {
    const enc = params?.enc ?? "hex";
    const format = `${alg}_${enc}`;
    const regex = regexes_exports[format];
    if (!regex)
      throw new Error(`Unrecognized hash format: ${format}`);
    return _stringFormat(ZodCustomStringFormat, format, regex, params);
  }
  var ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
    $ZodNumber.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => numberProcessor(inst, ctx, json2, params);
    inst.gt = (value, params) => inst.check(_gt(value, params));
    inst.gte = (value, params) => inst.check(_gte(value, params));
    inst.min = (value, params) => inst.check(_gte(value, params));
    inst.lt = (value, params) => inst.check(_lt(value, params));
    inst.lte = (value, params) => inst.check(_lte(value, params));
    inst.max = (value, params) => inst.check(_lte(value, params));
    inst.int = (params) => inst.check(int(params));
    inst.safe = (params) => inst.check(int(params));
    inst.positive = (params) => inst.check(_gt(0, params));
    inst.nonnegative = (params) => inst.check(_gte(0, params));
    inst.negative = (params) => inst.check(_lt(0, params));
    inst.nonpositive = (params) => inst.check(_lte(0, params));
    inst.multipleOf = (value, params) => inst.check(_multipleOf(value, params));
    inst.step = (value, params) => inst.check(_multipleOf(value, params));
    inst.finite = () => inst;
    const bag = inst._zod.bag;
    inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
    inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
    inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? 0.5);
    inst.isFinite = true;
    inst.format = bag.format ?? null;
  });
  function number2(params) {
    return _number(ZodNumber, params);
  }
  var ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
    $ZodNumberFormat.init(inst, def);
    ZodNumber.init(inst, def);
  });
  function int(params) {
    return _int(ZodNumberFormat, params);
  }
  function float32(params) {
    return _float32(ZodNumberFormat, params);
  }
  function float64(params) {
    return _float64(ZodNumberFormat, params);
  }
  function int32(params) {
    return _int32(ZodNumberFormat, params);
  }
  function uint32(params) {
    return _uint32(ZodNumberFormat, params);
  }
  var ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
    $ZodBoolean.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => booleanProcessor(inst, ctx, json2, params);
  });
  function boolean2(params) {
    return _boolean(ZodBoolean, params);
  }
  var ZodBigInt = /* @__PURE__ */ $constructor("ZodBigInt", (inst, def) => {
    $ZodBigInt.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => bigintProcessor(inst, ctx, json2, params);
    inst.gte = (value, params) => inst.check(_gte(value, params));
    inst.min = (value, params) => inst.check(_gte(value, params));
    inst.gt = (value, params) => inst.check(_gt(value, params));
    inst.gte = (value, params) => inst.check(_gte(value, params));
    inst.min = (value, params) => inst.check(_gte(value, params));
    inst.lt = (value, params) => inst.check(_lt(value, params));
    inst.lte = (value, params) => inst.check(_lte(value, params));
    inst.max = (value, params) => inst.check(_lte(value, params));
    inst.positive = (params) => inst.check(_gt(BigInt(0), params));
    inst.negative = (params) => inst.check(_lt(BigInt(0), params));
    inst.nonpositive = (params) => inst.check(_lte(BigInt(0), params));
    inst.nonnegative = (params) => inst.check(_gte(BigInt(0), params));
    inst.multipleOf = (value, params) => inst.check(_multipleOf(value, params));
    const bag = inst._zod.bag;
    inst.minValue = bag.minimum ?? null;
    inst.maxValue = bag.maximum ?? null;
    inst.format = bag.format ?? null;
  });
  function bigint2(params) {
    return _bigint(ZodBigInt, params);
  }
  var ZodBigIntFormat = /* @__PURE__ */ $constructor("ZodBigIntFormat", (inst, def) => {
    $ZodBigIntFormat.init(inst, def);
    ZodBigInt.init(inst, def);
  });
  function int64(params) {
    return _int64(ZodBigIntFormat, params);
  }
  function uint64(params) {
    return _uint64(ZodBigIntFormat, params);
  }
  var ZodSymbol = /* @__PURE__ */ $constructor("ZodSymbol", (inst, def) => {
    $ZodSymbol.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => symbolProcessor(inst, ctx, json2, params);
  });
  function symbol(params) {
    return _symbol(ZodSymbol, params);
  }
  var ZodUndefined = /* @__PURE__ */ $constructor("ZodUndefined", (inst, def) => {
    $ZodUndefined.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => undefinedProcessor(inst, ctx, json2, params);
  });
  function _undefined3(params) {
    return _undefined2(ZodUndefined, params);
  }
  var ZodNull = /* @__PURE__ */ $constructor("ZodNull", (inst, def) => {
    $ZodNull.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => nullProcessor(inst, ctx, json2, params);
  });
  function _null3(params) {
    return _null2(ZodNull, params);
  }
  var ZodAny = /* @__PURE__ */ $constructor("ZodAny", (inst, def) => {
    $ZodAny.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => anyProcessor(inst, ctx, json2, params);
  });
  function any() {
    return _any(ZodAny);
  }
  var ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
    $ZodUnknown.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => unknownProcessor(inst, ctx, json2, params);
  });
  function unknown() {
    return _unknown(ZodUnknown);
  }
  var ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
    $ZodNever.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => neverProcessor(inst, ctx, json2, params);
  });
  function never(params) {
    return _never(ZodNever, params);
  }
  var ZodVoid = /* @__PURE__ */ $constructor("ZodVoid", (inst, def) => {
    $ZodVoid.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => voidProcessor(inst, ctx, json2, params);
  });
  function _void2(params) {
    return _void(ZodVoid, params);
  }
  var ZodDate = /* @__PURE__ */ $constructor("ZodDate", (inst, def) => {
    $ZodDate.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => dateProcessor(inst, ctx, json2, params);
    inst.min = (value, params) => inst.check(_gte(value, params));
    inst.max = (value, params) => inst.check(_lte(value, params));
    const c = inst._zod.bag;
    inst.minDate = c.minimum ? new Date(c.minimum) : null;
    inst.maxDate = c.maximum ? new Date(c.maximum) : null;
  });
  function date3(params) {
    return _date(ZodDate, params);
  }
  var ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
    $ZodArray.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => arrayProcessor(inst, ctx, json2, params);
    inst.element = def.element;
    inst.min = (minLength, params) => inst.check(_minLength(minLength, params));
    inst.nonempty = (params) => inst.check(_minLength(1, params));
    inst.max = (maxLength, params) => inst.check(_maxLength(maxLength, params));
    inst.length = (len, params) => inst.check(_length(len, params));
    inst.unwrap = () => inst.element;
  });
  function array(element, params) {
    return _array(ZodArray, element, params);
  }
  function keyof(schema) {
    const shape = schema._zod.def.shape;
    return _enum2(Object.keys(shape));
  }
  var ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
    $ZodObjectJIT.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => objectProcessor(inst, ctx, json2, params);
    util_exports.defineLazy(inst, "shape", () => {
      return def.shape;
    });
    inst.keyof = () => _enum2(Object.keys(inst._zod.def.shape));
    inst.catchall = (catchall) => inst.clone({ ...inst._zod.def, catchall });
    inst.passthrough = () => inst.clone({ ...inst._zod.def, catchall: unknown() });
    inst.loose = () => inst.clone({ ...inst._zod.def, catchall: unknown() });
    inst.strict = () => inst.clone({ ...inst._zod.def, catchall: never() });
    inst.strip = () => inst.clone({ ...inst._zod.def, catchall: void 0 });
    inst.extend = (incoming) => {
      return util_exports.extend(inst, incoming);
    };
    inst.safeExtend = (incoming) => {
      return util_exports.safeExtend(inst, incoming);
    };
    inst.merge = (other) => util_exports.merge(inst, other);
    inst.pick = (mask) => util_exports.pick(inst, mask);
    inst.omit = (mask) => util_exports.omit(inst, mask);
    inst.partial = (...args) => util_exports.partial(ZodOptional, inst, args[0]);
    inst.required = (...args) => util_exports.required(ZodNonOptional, inst, args[0]);
  });
  function object(shape, params) {
    const def = {
      type: "object",
      shape: shape ?? {},
      ...util_exports.normalizeParams(params)
    };
    return new ZodObject(def);
  }
  function strictObject(shape, params) {
    return new ZodObject({
      type: "object",
      shape,
      catchall: never(),
      ...util_exports.normalizeParams(params)
    });
  }
  function looseObject(shape, params) {
    return new ZodObject({
      type: "object",
      shape,
      catchall: unknown(),
      ...util_exports.normalizeParams(params)
    });
  }
  var ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
    $ZodUnion.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => unionProcessor(inst, ctx, json2, params);
    inst.options = def.options;
  });
  function union(options, params) {
    return new ZodUnion({
      type: "union",
      options,
      ...util_exports.normalizeParams(params)
    });
  }
  var ZodXor = /* @__PURE__ */ $constructor("ZodXor", (inst, def) => {
    ZodUnion.init(inst, def);
    $ZodXor.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => unionProcessor(inst, ctx, json2, params);
    inst.options = def.options;
  });
  function xor(options, params) {
    return new ZodXor({
      type: "union",
      options,
      inclusive: false,
      ...util_exports.normalizeParams(params)
    });
  }
  var ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("ZodDiscriminatedUnion", (inst, def) => {
    ZodUnion.init(inst, def);
    $ZodDiscriminatedUnion.init(inst, def);
  });
  function discriminatedUnion(discriminator, options, params) {
    return new ZodDiscriminatedUnion({
      type: "union",
      options,
      discriminator,
      ...util_exports.normalizeParams(params)
    });
  }
  var ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
    $ZodIntersection.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => intersectionProcessor(inst, ctx, json2, params);
  });
  function intersection(left, right) {
    return new ZodIntersection({
      type: "intersection",
      left,
      right
    });
  }
  var ZodTuple = /* @__PURE__ */ $constructor("ZodTuple", (inst, def) => {
    $ZodTuple.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => tupleProcessor(inst, ctx, json2, params);
    inst.rest = (rest) => inst.clone({
      ...inst._zod.def,
      rest
    });
  });
  function tuple(items, _paramsOrRest, _params) {
    const hasRest = _paramsOrRest instanceof $ZodType;
    const params = hasRest ? _params : _paramsOrRest;
    const rest = hasRest ? _paramsOrRest : null;
    return new ZodTuple({
      type: "tuple",
      items,
      rest,
      ...util_exports.normalizeParams(params)
    });
  }
  var ZodRecord = /* @__PURE__ */ $constructor("ZodRecord", (inst, def) => {
    $ZodRecord.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => recordProcessor(inst, ctx, json2, params);
    inst.keyType = def.keyType;
    inst.valueType = def.valueType;
  });
  function record(keyType, valueType, params) {
    return new ZodRecord({
      type: "record",
      keyType,
      valueType,
      ...util_exports.normalizeParams(params)
    });
  }
  function partialRecord(keyType, valueType, params) {
    const k = clone(keyType);
    k._zod.values = void 0;
    return new ZodRecord({
      type: "record",
      keyType: k,
      valueType,
      ...util_exports.normalizeParams(params)
    });
  }
  function looseRecord(keyType, valueType, params) {
    return new ZodRecord({
      type: "record",
      keyType,
      valueType,
      mode: "loose",
      ...util_exports.normalizeParams(params)
    });
  }
  var ZodMap = /* @__PURE__ */ $constructor("ZodMap", (inst, def) => {
    $ZodMap.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => mapProcessor(inst, ctx, json2, params);
    inst.keyType = def.keyType;
    inst.valueType = def.valueType;
  });
  function map(keyType, valueType, params) {
    return new ZodMap({
      type: "map",
      keyType,
      valueType,
      ...util_exports.normalizeParams(params)
    });
  }
  var ZodSet = /* @__PURE__ */ $constructor("ZodSet", (inst, def) => {
    $ZodSet.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => setProcessor(inst, ctx, json2, params);
    inst.min = (...args) => inst.check(_minSize(...args));
    inst.nonempty = (params) => inst.check(_minSize(1, params));
    inst.max = (...args) => inst.check(_maxSize(...args));
    inst.size = (...args) => inst.check(_size(...args));
  });
  function set(valueType, params) {
    return new ZodSet({
      type: "set",
      valueType,
      ...util_exports.normalizeParams(params)
    });
  }
  var ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
    $ZodEnum.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => enumProcessor(inst, ctx, json2, params);
    inst.enum = def.entries;
    inst.options = Object.values(def.entries);
    const keys = new Set(Object.keys(def.entries));
    inst.extract = (values, params) => {
      const newEntries = {};
      for (const value of values) {
        if (keys.has(value)) {
          newEntries[value] = def.entries[value];
        } else
          throw new Error(`Key ${value} not found in enum`);
      }
      return new ZodEnum({
        ...def,
        checks: [],
        ...util_exports.normalizeParams(params),
        entries: newEntries
      });
    };
    inst.exclude = (values, params) => {
      const newEntries = { ...def.entries };
      for (const value of values) {
        if (keys.has(value)) {
          delete newEntries[value];
        } else
          throw new Error(`Key ${value} not found in enum`);
      }
      return new ZodEnum({
        ...def,
        checks: [],
        ...util_exports.normalizeParams(params),
        entries: newEntries
      });
    };
  });
  function _enum2(values, params) {
    const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
    return new ZodEnum({
      type: "enum",
      entries,
      ...util_exports.normalizeParams(params)
    });
  }
  function nativeEnum(entries, params) {
    return new ZodEnum({
      type: "enum",
      entries,
      ...util_exports.normalizeParams(params)
    });
  }
  var ZodLiteral = /* @__PURE__ */ $constructor("ZodLiteral", (inst, def) => {
    $ZodLiteral.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => literalProcessor(inst, ctx, json2, params);
    inst.values = new Set(def.values);
    Object.defineProperty(inst, "value", {
      get() {
        if (def.values.length > 1) {
          throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
        }
        return def.values[0];
      }
    });
  });
  function literal(value, params) {
    return new ZodLiteral({
      type: "literal",
      values: Array.isArray(value) ? value : [value],
      ...util_exports.normalizeParams(params)
    });
  }
  var ZodFile = /* @__PURE__ */ $constructor("ZodFile", (inst, def) => {
    $ZodFile.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => fileProcessor(inst, ctx, json2, params);
    inst.min = (size, params) => inst.check(_minSize(size, params));
    inst.max = (size, params) => inst.check(_maxSize(size, params));
    inst.mime = (types, params) => inst.check(_mime(Array.isArray(types) ? types : [types], params));
  });
  function file(params) {
    return _file(ZodFile, params);
  }
  var ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
    $ZodTransform.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => transformProcessor(inst, ctx, json2, params);
    inst._zod.parse = (payload, _ctx) => {
      if (_ctx.direction === "backward") {
        throw new $ZodEncodeError(inst.constructor.name);
      }
      payload.addIssue = (issue2) => {
        if (typeof issue2 === "string") {
          payload.issues.push(util_exports.issue(issue2, payload.value, def));
        } else {
          const _issue = issue2;
          if (_issue.fatal)
            _issue.continue = false;
          _issue.code ?? (_issue.code = "custom");
          _issue.input ?? (_issue.input = payload.value);
          _issue.inst ?? (_issue.inst = inst);
          payload.issues.push(util_exports.issue(_issue));
        }
      };
      const output = def.transform(payload.value, payload);
      if (output instanceof Promise) {
        return output.then((output2) => {
          payload.value = output2;
          return payload;
        });
      }
      payload.value = output;
      return payload;
    };
  });
  function transform(fn) {
    return new ZodTransform({
      type: "transform",
      transform: fn
    });
  }
  var ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
    $ZodOptional.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => optionalProcessor(inst, ctx, json2, params);
    inst.unwrap = () => inst._zod.def.innerType;
  });
  function optional(innerType) {
    return new ZodOptional({
      type: "optional",
      innerType
    });
  }
  var ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
    $ZodNullable.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => nullableProcessor(inst, ctx, json2, params);
    inst.unwrap = () => inst._zod.def.innerType;
  });
  function nullable(innerType) {
    return new ZodNullable({
      type: "nullable",
      innerType
    });
  }
  function nullish2(innerType) {
    return optional(nullable(innerType));
  }
  var ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
    $ZodDefault.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => defaultProcessor(inst, ctx, json2, params);
    inst.unwrap = () => inst._zod.def.innerType;
    inst.removeDefault = inst.unwrap;
  });
  function _default2(innerType, defaultValue) {
    return new ZodDefault({
      type: "default",
      innerType,
      get defaultValue() {
        return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
      }
    });
  }
  var ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
    $ZodPrefault.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => prefaultProcessor(inst, ctx, json2, params);
    inst.unwrap = () => inst._zod.def.innerType;
  });
  function prefault(innerType, defaultValue) {
    return new ZodPrefault({
      type: "prefault",
      innerType,
      get defaultValue() {
        return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
      }
    });
  }
  var ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
    $ZodNonOptional.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => nonoptionalProcessor(inst, ctx, json2, params);
    inst.unwrap = () => inst._zod.def.innerType;
  });
  function nonoptional(innerType, params) {
    return new ZodNonOptional({
      type: "nonoptional",
      innerType,
      ...util_exports.normalizeParams(params)
    });
  }
  var ZodSuccess = /* @__PURE__ */ $constructor("ZodSuccess", (inst, def) => {
    $ZodSuccess.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => successProcessor(inst, ctx, json2, params);
    inst.unwrap = () => inst._zod.def.innerType;
  });
  function success(innerType) {
    return new ZodSuccess({
      type: "success",
      innerType
    });
  }
  var ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
    $ZodCatch.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => catchProcessor(inst, ctx, json2, params);
    inst.unwrap = () => inst._zod.def.innerType;
    inst.removeCatch = inst.unwrap;
  });
  function _catch2(innerType, catchValue) {
    return new ZodCatch({
      type: "catch",
      innerType,
      catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
    });
  }
  var ZodNaN = /* @__PURE__ */ $constructor("ZodNaN", (inst, def) => {
    $ZodNaN.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => nanProcessor(inst, ctx, json2, params);
  });
  function nan(params) {
    return _nan(ZodNaN, params);
  }
  var ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
    $ZodPipe.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => pipeProcessor(inst, ctx, json2, params);
    inst.in = def.in;
    inst.out = def.out;
  });
  function pipe(in_, out) {
    return new ZodPipe({
      type: "pipe",
      in: in_,
      out
      // ...util.normalizeParams(params),
    });
  }
  var ZodCodec = /* @__PURE__ */ $constructor("ZodCodec", (inst, def) => {
    ZodPipe.init(inst, def);
    $ZodCodec.init(inst, def);
  });
  function codec(in_, out, params) {
    return new ZodCodec({
      type: "pipe",
      in: in_,
      out,
      transform: params.decode,
      reverseTransform: params.encode
    });
  }
  var ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
    $ZodReadonly.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => readonlyProcessor(inst, ctx, json2, params);
    inst.unwrap = () => inst._zod.def.innerType;
  });
  function readonly(innerType) {
    return new ZodReadonly({
      type: "readonly",
      innerType
    });
  }
  var ZodTemplateLiteral = /* @__PURE__ */ $constructor("ZodTemplateLiteral", (inst, def) => {
    $ZodTemplateLiteral.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => templateLiteralProcessor(inst, ctx, json2, params);
  });
  function templateLiteral(parts, params) {
    return new ZodTemplateLiteral({
      type: "template_literal",
      parts,
      ...util_exports.normalizeParams(params)
    });
  }
  var ZodLazy = /* @__PURE__ */ $constructor("ZodLazy", (inst, def) => {
    $ZodLazy.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => lazyProcessor(inst, ctx, json2, params);
    inst.unwrap = () => inst._zod.def.getter();
  });
  function lazy(getter) {
    return new ZodLazy({
      type: "lazy",
      getter
    });
  }
  var ZodPromise = /* @__PURE__ */ $constructor("ZodPromise", (inst, def) => {
    $ZodPromise.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => promiseProcessor(inst, ctx, json2, params);
    inst.unwrap = () => inst._zod.def.innerType;
  });
  function promise(innerType) {
    return new ZodPromise({
      type: "promise",
      innerType
    });
  }
  var ZodFunction = /* @__PURE__ */ $constructor("ZodFunction", (inst, def) => {
    $ZodFunction.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => functionProcessor(inst, ctx, json2, params);
  });
  function _function(params) {
    return new ZodFunction({
      type: "function",
      input: Array.isArray(params?.input) ? tuple(params?.input) : params?.input ?? array(unknown()),
      output: params?.output ?? unknown()
    });
  }
  var ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
    $ZodCustom.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json2, params) => customProcessor(inst, ctx, json2, params);
  });
  function check(fn) {
    const ch = new $ZodCheck({
      check: "custom"
      // ...util.normalizeParams(params),
    });
    ch._zod.check = fn;
    return ch;
  }
  function custom(fn, _params) {
    return _custom(ZodCustom, fn ?? (() => true), _params);
  }
  function refine(fn, _params = {}) {
    return _refine(ZodCustom, fn, _params);
  }
  function superRefine(fn) {
    return _superRefine(fn);
  }
  var describe2 = describe;
  var meta2 = meta;
  function _instanceof(cls, params = {
    error: `Input not instance of ${cls.name}`
  }) {
    const inst = new ZodCustom({
      type: "custom",
      check: "custom",
      fn: (data) => data instanceof cls,
      abort: true,
      ...util_exports.normalizeParams(params)
    });
    inst._zod.bag.Class = cls;
    return inst;
  }
  var stringbool = (...args) => _stringbool({
    Codec: ZodCodec,
    Boolean: ZodBoolean,
    String: ZodString
  }, ...args);
  function json(params) {
    const jsonSchema = lazy(() => {
      return union([string2(params), number2(), boolean2(), _null3(), array(jsonSchema), record(string2(), jsonSchema)]);
    });
    return jsonSchema;
  }
  function preprocess(fn, schema) {
    return pipe(transform(fn), schema);
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/compat.js
  var ZodIssueCode = {
    invalid_type: "invalid_type",
    too_big: "too_big",
    too_small: "too_small",
    invalid_format: "invalid_format",
    not_multiple_of: "not_multiple_of",
    unrecognized_keys: "unrecognized_keys",
    invalid_union: "invalid_union",
    invalid_key: "invalid_key",
    invalid_element: "invalid_element",
    invalid_value: "invalid_value",
    custom: "custom"
  };
  function setErrorMap(map2) {
    config({
      customError: map2
    });
  }
  function getErrorMap() {
    return config().customError;
  }
  var ZodFirstPartyTypeKind;
  /* @__PURE__ */ (function(ZodFirstPartyTypeKind2) {
  })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/from-json-schema.js
  var z = {
    ...schemas_exports2,
    ...checks_exports2,
    iso: iso_exports
  };
  function detectVersion(schema, defaultTarget) {
    const $schema = schema.$schema;
    if ($schema === "https://json-schema.org/draft/2020-12/schema") {
      return "draft-2020-12";
    }
    if ($schema === "http://json-schema.org/draft-07/schema#") {
      return "draft-7";
    }
    if ($schema === "http://json-schema.org/draft-04/schema#") {
      return "draft-4";
    }
    return defaultTarget ?? "draft-2020-12";
  }
  function resolveRef(ref, ctx) {
    if (!ref.startsWith("#")) {
      throw new Error("External $ref is not supported, only local refs (#/...) are allowed");
    }
    const path = ref.slice(1).split("/").filter(Boolean);
    if (path.length === 0) {
      return ctx.rootSchema;
    }
    const defsKey = ctx.version === "draft-2020-12" ? "$defs" : "definitions";
    if (path[0] === defsKey) {
      const key = path[1];
      if (!key || !ctx.defs[key]) {
        throw new Error(`Reference not found: ${ref}`);
      }
      return ctx.defs[key];
    }
    throw new Error(`Reference not found: ${ref}`);
  }
  function convertBaseSchema(schema, ctx) {
    if (schema.not !== void 0) {
      if (typeof schema.not === "object" && Object.keys(schema.not).length === 0) {
        return z.never();
      }
      throw new Error("not is not supported in Zod (except { not: {} } for never)");
    }
    if (schema.unevaluatedItems !== void 0) {
      throw new Error("unevaluatedItems is not supported");
    }
    if (schema.unevaluatedProperties !== void 0) {
      throw new Error("unevaluatedProperties is not supported");
    }
    if (schema.if !== void 0 || schema.then !== void 0 || schema.else !== void 0) {
      throw new Error("Conditional schemas (if/then/else) are not supported");
    }
    if (schema.dependentSchemas !== void 0 || schema.dependentRequired !== void 0) {
      throw new Error("dependentSchemas and dependentRequired are not supported");
    }
    if (schema.$ref) {
      const refPath = schema.$ref;
      if (ctx.refs.has(refPath)) {
        return ctx.refs.get(refPath);
      }
      if (ctx.processing.has(refPath)) {
        return z.lazy(() => {
          if (!ctx.refs.has(refPath)) {
            throw new Error(`Circular reference not resolved: ${refPath}`);
          }
          return ctx.refs.get(refPath);
        });
      }
      ctx.processing.add(refPath);
      const resolved = resolveRef(refPath, ctx);
      const zodSchema2 = convertSchema(resolved, ctx);
      ctx.refs.set(refPath, zodSchema2);
      ctx.processing.delete(refPath);
      return zodSchema2;
    }
    if (schema.enum !== void 0) {
      const enumValues = schema.enum;
      if (ctx.version === "openapi-3.0" && schema.nullable === true && enumValues.length === 1 && enumValues[0] === null) {
        return z.null();
      }
      if (enumValues.length === 0) {
        return z.never();
      }
      if (enumValues.length === 1) {
        return z.literal(enumValues[0]);
      }
      if (enumValues.every((v) => typeof v === "string")) {
        return z.enum(enumValues);
      }
      const literalSchemas = enumValues.map((v) => z.literal(v));
      if (literalSchemas.length < 2) {
        return literalSchemas[0];
      }
      return z.union([literalSchemas[0], literalSchemas[1], ...literalSchemas.slice(2)]);
    }
    if (schema.const !== void 0) {
      return z.literal(schema.const);
    }
    const type = schema.type;
    if (Array.isArray(type)) {
      const typeSchemas = type.map((t) => {
        const typeSchema = { ...schema, type: t };
        return convertBaseSchema(typeSchema, ctx);
      });
      if (typeSchemas.length === 0) {
        return z.never();
      }
      if (typeSchemas.length === 1) {
        return typeSchemas[0];
      }
      return z.union(typeSchemas);
    }
    if (!type) {
      return z.any();
    }
    let zodSchema;
    switch (type) {
      case "string": {
        let stringSchema = z.string();
        if (schema.format) {
          const format = schema.format;
          if (format === "email") {
            stringSchema = stringSchema.check(z.email());
          } else if (format === "uri" || format === "uri-reference") {
            stringSchema = stringSchema.check(z.url());
          } else if (format === "uuid" || format === "guid") {
            stringSchema = stringSchema.check(z.uuid());
          } else if (format === "date-time") {
            stringSchema = stringSchema.check(z.iso.datetime());
          } else if (format === "date") {
            stringSchema = stringSchema.check(z.iso.date());
          } else if (format === "time") {
            stringSchema = stringSchema.check(z.iso.time());
          } else if (format === "duration") {
            stringSchema = stringSchema.check(z.iso.duration());
          } else if (format === "ipv4") {
            stringSchema = stringSchema.check(z.ipv4());
          } else if (format === "ipv6") {
            stringSchema = stringSchema.check(z.ipv6());
          } else if (format === "mac") {
            stringSchema = stringSchema.check(z.mac());
          } else if (format === "cidr") {
            stringSchema = stringSchema.check(z.cidrv4());
          } else if (format === "cidr-v6") {
            stringSchema = stringSchema.check(z.cidrv6());
          } else if (format === "base64") {
            stringSchema = stringSchema.check(z.base64());
          } else if (format === "base64url") {
            stringSchema = stringSchema.check(z.base64url());
          } else if (format === "e164") {
            stringSchema = stringSchema.check(z.e164());
          } else if (format === "jwt") {
            stringSchema = stringSchema.check(z.jwt());
          } else if (format === "emoji") {
            stringSchema = stringSchema.check(z.emoji());
          } else if (format === "nanoid") {
            stringSchema = stringSchema.check(z.nanoid());
          } else if (format === "cuid") {
            stringSchema = stringSchema.check(z.cuid());
          } else if (format === "cuid2") {
            stringSchema = stringSchema.check(z.cuid2());
          } else if (format === "ulid") {
            stringSchema = stringSchema.check(z.ulid());
          } else if (format === "xid") {
            stringSchema = stringSchema.check(z.xid());
          } else if (format === "ksuid") {
            stringSchema = stringSchema.check(z.ksuid());
          }
        }
        if (typeof schema.minLength === "number") {
          stringSchema = stringSchema.min(schema.minLength);
        }
        if (typeof schema.maxLength === "number") {
          stringSchema = stringSchema.max(schema.maxLength);
        }
        if (schema.pattern) {
          stringSchema = stringSchema.regex(new RegExp(schema.pattern));
        }
        zodSchema = stringSchema;
        break;
      }
      case "number":
      case "integer": {
        let numberSchema = type === "integer" ? z.number().int() : z.number();
        if (typeof schema.minimum === "number") {
          numberSchema = numberSchema.min(schema.minimum);
        }
        if (typeof schema.maximum === "number") {
          numberSchema = numberSchema.max(schema.maximum);
        }
        if (typeof schema.exclusiveMinimum === "number") {
          numberSchema = numberSchema.gt(schema.exclusiveMinimum);
        } else if (schema.exclusiveMinimum === true && typeof schema.minimum === "number") {
          numberSchema = numberSchema.gt(schema.minimum);
        }
        if (typeof schema.exclusiveMaximum === "number") {
          numberSchema = numberSchema.lt(schema.exclusiveMaximum);
        } else if (schema.exclusiveMaximum === true && typeof schema.maximum === "number") {
          numberSchema = numberSchema.lt(schema.maximum);
        }
        if (typeof schema.multipleOf === "number") {
          numberSchema = numberSchema.multipleOf(schema.multipleOf);
        }
        zodSchema = numberSchema;
        break;
      }
      case "boolean": {
        zodSchema = z.boolean();
        break;
      }
      case "null": {
        zodSchema = z.null();
        break;
      }
      case "object": {
        const shape = {};
        const properties = schema.properties || {};
        const requiredSet = new Set(schema.required || []);
        for (const [key, propSchema] of Object.entries(properties)) {
          const propZodSchema = convertSchema(propSchema, ctx);
          shape[key] = requiredSet.has(key) ? propZodSchema : propZodSchema.optional();
        }
        if (schema.propertyNames) {
          const keySchema = convertSchema(schema.propertyNames, ctx);
          const valueSchema = schema.additionalProperties && typeof schema.additionalProperties === "object" ? convertSchema(schema.additionalProperties, ctx) : z.any();
          if (Object.keys(shape).length === 0) {
            zodSchema = z.record(keySchema, valueSchema);
            break;
          }
          const objectSchema2 = z.object(shape).passthrough();
          const recordSchema = z.looseRecord(keySchema, valueSchema);
          zodSchema = z.intersection(objectSchema2, recordSchema);
          break;
        }
        if (schema.patternProperties) {
          const patternProps = schema.patternProperties;
          const patternKeys = Object.keys(patternProps);
          const looseRecords = [];
          for (const pattern of patternKeys) {
            const patternValue = convertSchema(patternProps[pattern], ctx);
            const keySchema = z.string().regex(new RegExp(pattern));
            looseRecords.push(z.looseRecord(keySchema, patternValue));
          }
          const schemasToIntersect = [];
          if (Object.keys(shape).length > 0) {
            schemasToIntersect.push(z.object(shape).passthrough());
          }
          schemasToIntersect.push(...looseRecords);
          if (schemasToIntersect.length === 0) {
            zodSchema = z.object({}).passthrough();
          } else if (schemasToIntersect.length === 1) {
            zodSchema = schemasToIntersect[0];
          } else {
            let result = z.intersection(schemasToIntersect[0], schemasToIntersect[1]);
            for (let i = 2; i < schemasToIntersect.length; i++) {
              result = z.intersection(result, schemasToIntersect[i]);
            }
            zodSchema = result;
          }
          break;
        }
        const objectSchema = z.object(shape);
        if (schema.additionalProperties === false) {
          zodSchema = objectSchema.strict();
        } else if (typeof schema.additionalProperties === "object") {
          zodSchema = objectSchema.catchall(convertSchema(schema.additionalProperties, ctx));
        } else {
          zodSchema = objectSchema.passthrough();
        }
        break;
      }
      case "array": {
        const prefixItems = schema.prefixItems;
        const items = schema.items;
        if (prefixItems && Array.isArray(prefixItems)) {
          const tupleItems = prefixItems.map((item) => convertSchema(item, ctx));
          const rest = items && typeof items === "object" && !Array.isArray(items) ? convertSchema(items, ctx) : void 0;
          if (rest) {
            zodSchema = z.tuple(tupleItems).rest(rest);
          } else {
            zodSchema = z.tuple(tupleItems);
          }
          if (typeof schema.minItems === "number") {
            zodSchema = zodSchema.check(z.minLength(schema.minItems));
          }
          if (typeof schema.maxItems === "number") {
            zodSchema = zodSchema.check(z.maxLength(schema.maxItems));
          }
        } else if (Array.isArray(items)) {
          const tupleItems = items.map((item) => convertSchema(item, ctx));
          const rest = schema.additionalItems && typeof schema.additionalItems === "object" ? convertSchema(schema.additionalItems, ctx) : void 0;
          if (rest) {
            zodSchema = z.tuple(tupleItems).rest(rest);
          } else {
            zodSchema = z.tuple(tupleItems);
          }
          if (typeof schema.minItems === "number") {
            zodSchema = zodSchema.check(z.minLength(schema.minItems));
          }
          if (typeof schema.maxItems === "number") {
            zodSchema = zodSchema.check(z.maxLength(schema.maxItems));
          }
        } else if (items !== void 0) {
          const element = convertSchema(items, ctx);
          let arraySchema = z.array(element);
          if (typeof schema.minItems === "number") {
            arraySchema = arraySchema.min(schema.minItems);
          }
          if (typeof schema.maxItems === "number") {
            arraySchema = arraySchema.max(schema.maxItems);
          }
          zodSchema = arraySchema;
        } else {
          zodSchema = z.array(z.any());
        }
        break;
      }
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
    if (schema.description) {
      zodSchema = zodSchema.describe(schema.description);
    }
    if (schema.default !== void 0) {
      zodSchema = zodSchema.default(schema.default);
    }
    return zodSchema;
  }
  function convertSchema(schema, ctx) {
    if (typeof schema === "boolean") {
      return schema ? z.any() : z.never();
    }
    let baseSchema = convertBaseSchema(schema, ctx);
    const hasExplicitType = schema.type || schema.enum !== void 0 || schema.const !== void 0;
    if (schema.anyOf && Array.isArray(schema.anyOf)) {
      const options = schema.anyOf.map((s) => convertSchema(s, ctx));
      const anyOfUnion = z.union(options);
      baseSchema = hasExplicitType ? z.intersection(baseSchema, anyOfUnion) : anyOfUnion;
    }
    if (schema.oneOf && Array.isArray(schema.oneOf)) {
      const options = schema.oneOf.map((s) => convertSchema(s, ctx));
      const oneOfUnion = z.xor(options);
      baseSchema = hasExplicitType ? z.intersection(baseSchema, oneOfUnion) : oneOfUnion;
    }
    if (schema.allOf && Array.isArray(schema.allOf)) {
      if (schema.allOf.length === 0) {
        baseSchema = hasExplicitType ? baseSchema : z.any();
      } else {
        let result = hasExplicitType ? baseSchema : convertSchema(schema.allOf[0], ctx);
        const startIdx = hasExplicitType ? 0 : 1;
        for (let i = startIdx; i < schema.allOf.length; i++) {
          result = z.intersection(result, convertSchema(schema.allOf[i], ctx));
        }
        baseSchema = result;
      }
    }
    if (schema.nullable === true && ctx.version === "openapi-3.0") {
      baseSchema = z.nullable(baseSchema);
    }
    if (schema.readOnly === true) {
      baseSchema = z.readonly(baseSchema);
    }
    return baseSchema;
  }
  function fromJSONSchema(schema, params) {
    if (typeof schema === "boolean") {
      return schema ? z.any() : z.never();
    }
    const version2 = detectVersion(schema, params?.defaultTarget);
    const defs = schema.$defs || schema.definitions || {};
    const ctx = {
      version: version2,
      defs,
      refs: /* @__PURE__ */ new Map(),
      processing: /* @__PURE__ */ new Set(),
      rootSchema: schema
    };
    return convertSchema(schema, ctx);
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/coerce.js
  var coerce_exports = {};
  __export(coerce_exports, {
    bigint: () => bigint3,
    boolean: () => boolean3,
    date: () => date4,
    number: () => number3,
    string: () => string3
  });
  function string3(params) {
    return _coercedString(ZodString, params);
  }
  function number3(params) {
    return _coercedNumber(ZodNumber, params);
  }
  function boolean3(params) {
    return _coercedBoolean(ZodBoolean, params);
  }
  function bigint3(params) {
    return _coercedBigint(ZodBigInt, params);
  }
  function date4(params) {
    return _coercedDate(ZodDate, params);
  }

  // node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/external.js
  config(en_default());

  // shared/dg-settings-snapshot.ts
  var DG_SETTINGS_EVENT = "autobac-dg-run-started";
  var DG_SETTINGS_SYNC_EVENT = "autobac-dg-settings-sync";
  var DG_SETTINGS_VERSION = 1;
  var dgProviderSchema = external_exports.enum([
    "chatgpt",
    "gemini",
    "grok",
    "meta",
    "combined",
    "road",
    "counting",
    "parity"
  ]);
  var safePositiveInt = external_exports.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
  var durationMaxMinutes = Math.floor(Number.MAX_SAFE_INTEGER / 6e4);
  var dgTableSchema = external_exports.object({
    // DG's native table IDs are numeric strings. Do not coerce or accept URLs/objects.
    tableId: external_exports.string().regex(/^\d{1,32}$/),
    // Native names are short labels such as RB04, S03, or a DG-provided Chinese label.
    // Rendering remains escaped because a stored database value is never trusted HTML.
    tableName: external_exports.string().min(1).max(64).refine((value) => value.trim().length > 0, "tableName must not be blank")
  }).strict();
  var dgSettingsSnapshotSchema = external_exports.object({
    version: external_exports.literal(DG_SETTINGS_VERSION),
    gamePlatform: external_exports.literal("DG"),
    runMode: external_exports.enum(["continuous", "once"]),
    startMode: external_exports.enum(["fresh", "resume"]),
    provider: dgProviderSchema,
    tableCount: external_exports.enum(["1", "3", "5", "all"]),
    selectionMode: external_exports.enum(["auto", "manual"]),
    selectedTables: external_exports.array(dgTableSchema).max(100),
    baseAmount: safePositiveInt,
    staking: external_exports.enum(["flat", "martingale", "doubling"]),
    maxStake: safePositiveInt,
    stopLoss: safePositiveInt.nullable(),
    takeProfit: safePositiveInt.nullable(),
    // This exactly mirrors parseDurationMinutes' numeric safe range (including zero).
    durationMinutes: external_exports.number().int().min(0).max(durationMaxMinutes),
    minSeconds: external_exports.number().int().min(1).max(60),
    // A code or numeric string only, never a URL or free-form value.
    currency: external_exports.string().regex(/^[A-Za-z0-9]{1,16}$/)
  }).strict().superRefine((snapshot, ctx) => {
    if (snapshot.maxStake < snapshot.baseAmount) {
      ctx.addIssue({ code: "custom", path: ["maxStake"], message: "maxStake must be at least baseAmount" });
    }
    if (snapshot.staking === "martingale" && (snapshot.stopLoss === null || snapshot.stopLoss < 2600)) {
      ctx.addIssue({ code: "custom", path: ["stopLoss"], message: "martingale requires stopLoss of at least 2600" });
    }
    const ids = /* @__PURE__ */ new Set();
    for (const [index, table] of snapshot.selectedTables.entries()) {
      if (ids.has(table.tableId)) {
        ctx.addIssue({ code: "custom", path: ["selectedTables", index, "tableId"], message: "duplicate tableId" });
      }
      ids.add(table.tableId);
    }
    if ((snapshot.tableCount !== "1" || snapshot.selectedTables.length > 1) && snapshot.staking !== "flat") {
      ctx.addIssue({ code: "custom", path: ["staking"], message: "multi-table runs require flat staking" });
    }
  });

  // shared/dg-risk-statement.ts
  var DG_RISK_STATEMENT = Object.freeze({
    version: "dg-risk-2026-10-16-v5-usage",
    title: "\u4F7F\u7528\u98A8\u96AA\u8072\u660E",
    text: "\u81EA\u884C\u6C7A\u5B9A\u958B\u555F,\u6240\u6709\u98A8\u96AA\u81EA\u884C\u627F\u64D4,\u4E0D\u4FDD\u8B49\u7A69\u5B9A\u7372\u5229,\u7A0B\u5F0F\u4E0D\u8CA0\u76F8\u95DC\u8CAC\u4EFB",
    acknowledgement: "\u6211\u5DF2\u95B1\u8B80\u4E26\u4E86\u89E3\u4E0A\u8FF0\u98A8\u96AA",
    recordNotice: "\u52FE\u9078\u5F8C\uFF0C\u60A8\u7684\u5E33\u865F\u3001\u52FE\u9078\u6642\u9593\u53CA\u8072\u660E\u7248\u672C\u6703\u56DE\u50B3\u81F3\u7BA1\u7406\u8005\u7684\u767D\u540D\u55AE\u5F8C\u53F0\u7559\u5B58\u7D00\u9304\u3002\u6210\u529F\u958B\u59CB\u6642\uFF0C\u7B56\u7565\u3001\u91D1\u984D\u3001\u9078\u684C\u3001\u914D\u6CE8\u3001\u6B62\u640D\u3001\u6B62\u76C8\u53CA\u6642\u9593\u7B49\u5BE6\u969B\u4F7F\u7528\u8A2D\u5B9A\uFF0C\u4EE5\u53CA\u672C\u6B21\u4F7F\u7528\u6642\u9593\u3001\u57F7\u884C\u72C0\u614B\u8207\u50C5\u9650\u672C\u6A5F\u5DF2\u9A57\u8B49\u6B63\u5F0F\u7D50\u7B97\u7684\u7D50\u679C\u5F59\u7E3D\uFF0C\u90FD\u6703\u56DE\u50B3\u4F9B\u7BA1\u7406\u8005\u67E5\u95B1\uFF1B\u5F85\u7D50\u7B97\u6216\u672A\u78BA\u5B9A\u9805\u76EE\u6703\u660E\u793A\u3002\u8A72\u7D50\u679C\u70BA\u5BA2\u6236\u7AEF\u56DE\u50B3\uFF0C\u975E DG \u5B98\u65B9\u4E0B\u6CE8\u6216\u7D50\u7B97\u5831\u8868\u3002\u767B\u5165\u5F8C\u6703\u56DE\u50B3\u9023\u7DDA\u8207\u57F7\u884C\u72C0\u614B\uFF0C\u4F9B\u7BA1\u7406\u8005\u7D71\u8A08\u5728\u7DDA\u5E33\u865F\uFF1B\u4E0D\u56DE\u50B3\u6ED1\u52D5\u3001\u62D6\u66F3\u3001\u7E2E\u653E\u3001\u539F\u751F\u5C01\u5305\u3001\u904A\u6232\u7DB2\u5740\u6216\u6191\u8B49\u3002"
  });
  var RISK_EVENT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // lib/dg-session-timer.ts
  function parseDurationMinutes(value) {
    const text = String(value ?? "").trim();
    if (text === "") return 0;
    if (!/^\d+$/.test(text)) throw new Error("\u81EA\u52D5\u505C\u6B62\u6642\u9593\u9808\u70BA\u6574\u6578\u5206\u9418\uFF1B0\u6216\u7559\u7A7A\u4EE3\u8868\u4E0D\u9650\u6642");
    const minutes = Number(text);
    if (!Number.isSafeInteger(minutes) || !Number.isSafeInteger(minutes * 6e4)) throw new Error("\u81EA\u52D5\u505C\u6B62\u6642\u9593\u8D85\u51FA\u53EF\u7528\u7BC4\u570D");
    return minutes;
  }
  function formatDuration(ms) {
    const seconds = Math.floor(Math.max(0, ms) / 1e3);
    return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map((n) => String(n).padStart(2, "0")).join(":");
  }
  function createDgSessionTimer(wallNow = () => Date.now(), monoNow = () => performance.now()) {
    let running = false, started = false, startWall = 0, startMono = 0, elapsedMs = 0, minutes = 0;
    function elapsed() {
      if (running) elapsedMs = Math.max(elapsedMs, 0, wallNow() - startWall, monoNow() - startMono);
      return elapsedMs;
    }
    return {
      start(value) {
        minutes = parseDurationMinutes(value);
        startWall = wallNow();
        startMono = monoNow();
        elapsedMs = 0;
        started = true;
        running = true;
      },
      stop() {
        elapsed();
        running = false;
      },
      expired() {
        return running && minutes > 0 && elapsed() >= minutes * 6e4;
      },
      view() {
        const usedMs = elapsed();
        return { running, started, minutes, elapsedMs: usedMs, remainingMs: minutes > 0 ? Math.max(0, minutes * 6e4 - usedMs) : null, elapsedText: formatDuration(usedMs) };
      }
    };
  }

  // lib/dg-usage-history.ts
  var states = /* @__PURE__ */ new Set(["reserved", "submitted", "accepted", "settled", "uncertain", "rejected", "aborted"]);
  function createDgUsageRunId() {
    const randomUUID = globalThis.crypto?.randomUUID;
    if (typeof randomUUID === "function") return randomUUID.call(globalThis.crypto);
    const bytes = new Uint8Array(16);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
    else for (let index = 0; index < bytes.length; index++) bytes[index] = Math.floor(Math.random() * 256);
    bytes[6] = bytes[6] & 15 | 64;
    bytes[8] = bytes[8] & 63 | 128;
    const hex3 = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex3.slice(0, 8)}-${hex3.slice(8, 12)}-${hex3.slice(12, 16)}-${hex3.slice(16, 20)}-${hex3.slice(20)}`;
  }
  function usageHistoryInPeriod(rows, period, now = Date.now()) {
    const day = 864e5, offset = 288e5, start = Math.floor((now + offset) / day) * day - offset;
    const from = period === "yesterday" ? start - day : period === "week" ? start - 6 * day : start;
    const until = period === "yesterday" ? start : start + day;
    return rows.filter((row) => row.createdAt >= from && row.createdAt < until);
  }
  function createDgUsageHistory(now = () => Date.now()) {
    let runs = [];
    let activeId = null;
    function active() {
      return runs.find((run) => run.id === activeId);
    }
    function viewRun(run) {
      const entries = Object.values(run.bets);
      const settled = entries.filter((entry) => entry.state === "settled" && entry.pnl !== null);
      const eventCounts = {
        reserved: 0,
        submitted: 0,
        accepted: 0,
        settled: 0,
        uncertain: 0,
        rejected: 0,
        aborted: 0
      };
      for (const entry of entries) eventCounts[entry.state]++;
      return {
        ...run,
        bets: Object.fromEntries(Object.entries(run.bets).map(([key, entry]) => [key, { ...entry }])),
        elapsedText: formatDuration(run.elapsedMs),
        pnl: settled.reduce((sum, entry) => sum + entry.pnl, 0),
        settledCount: settled.length,
        wins: settled.filter((entry) => entry.pnl > 0).length,
        losses: settled.filter((entry) => entry.pnl < 0).length,
        pendingCount: entries.filter((entry) => ["reserved", "submitted", "accepted"].includes(entry.state)).length,
        uncertainCount: entries.filter((entry) => entry.state === "uncertain" || entry.state === "settled" && entry.pnl === null).length,
        eventCounts
      };
    }
    return {
      load(value) {
        runs = [];
        activeId = null;
        const saved = value;
        if (saved?.version !== 1 || !Array.isArray(saved.runs)) return;
        const owners = /* @__PURE__ */ new Set();
        const ids = /* @__PURE__ */ new Set();
        for (const value2 of saved.runs) {
          const r = value2;
          if (!r || typeof r.id !== "string" || !RISK_EVENT_ID.test(r.id) || ids.has(r.id) || !Number.isFinite(r.createdAt) || !Number.isFinite(r.elapsedMs) || r.elapsedMs < 0 || !Number.isFinite(r.updatedAt) || !Number.isSafeInteger(r.minutes) || r.minutes < 0 || !["active", "stopped", "interrupted"].includes(r.state)) continue;
          const bets = /* @__PURE__ */ Object.create(null);
          if (r.bets && typeof r.bets === "object") for (const [key, b] of Object.entries(r.bets)) {
            if (owners.has(key) || !b || !states.has(b.state)) continue;
            const entry = b;
            bets[key] = { state: entry.state, pnl: entry.state === "settled" && Number.isFinite(entry.pnl) ? entry.pnl : null };
            owners.add(key);
          }
          ids.add(r.id);
          runs.push({
            id: r.id,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            // A page rebuild does not prove a user stop. Keep the last observed duration,
            // but do not invent an end time while changing the local view to interrupted.
            endedAt: r.state === "active" ? null : Number.isFinite(r.endedAt) ? r.endedAt : r.updatedAt,
            elapsedMs: r.elapsedMs,
            minutes: r.minutes,
            state: r.state === "active" ? "interrupted" : r.state,
            bets
          });
        }
      },
      begin(minutes, runId = createDgUsageRunId()) {
        if (active()) throw new Error("\u524D\u6B21\u4F7F\u7528\u5C1A\u672A\u505C\u6B62\uFF0C\u4E0D\u91CD\u8A2D\u4F7F\u7528\u7D00\u9304");
        if (!Number.isSafeInteger(minutes) || minutes < 0 || !RISK_EVENT_ID.test(runId)) throw new Error("\u4F7F\u7528\u7D00\u9304\u8B58\u5225\u78BC\u7121\u6548");
        const at = now();
        const run = { id: runId, createdAt: at, endedAt: null, updatedAt: at, elapsedMs: 0, minutes, state: "active", bets: /* @__PURE__ */ Object.create(null) };
        runs.push(run);
        activeId = runId;
        if (runs.length > 100) {
          const disposable = runs.findIndex((item) => item.id !== activeId && Object.values(item.bets).every((entry) => ["settled", "rejected", "aborted"].includes(entry.state)));
          if (disposable >= 0) runs.splice(disposable, 1);
        }
        return runId;
      },
      addBet(bet) {
        if (runs.some((run2) => Object.prototype.hasOwnProperty.call(run2.bets, bet.key))) return;
        const run = active();
        if (run) run.bets[bet.key] = { state: bet.state, pnl: null };
      },
      sync(bets) {
        const byKey = new Map(bets.map((bet) => [bet.key, bet]));
        for (const run of runs) {
          let changed = false;
          for (const [key, entry] of Object.entries(run.bets)) {
            const bet = byKey.get(key);
            if (!bet) continue;
            const pnl = bet.state === "settled" && Number.isFinite(bet.pnl) ? bet.pnl : null;
            if (entry.state !== bet.state || entry.pnl !== pnl) changed = true;
            entry.state = bet.state;
            entry.pnl = pnl;
          }
          if (changed) run.updatedAt = Math.max(run.updatedAt, now());
        }
      },
      updateElapsed(elapsedMs) {
        const run = active();
        if (!run || !Number.isFinite(elapsedMs)) return false;
        const used = Math.max(run.elapsedMs, elapsedMs);
        if (Math.floor(used / 1e3) === Math.floor(run.elapsedMs / 1e3)) return false;
        run.elapsedMs = used;
        run.updatedAt = now();
        return true;
      },
      finish(elapsedMs) {
        const run = active();
        if (!run) return void 0;
        run.elapsedMs = Math.max(run.elapsedMs, Number.isFinite(elapsedMs) ? elapsedMs : 0);
        run.endedAt = now();
        run.updatedAt = run.endedAt;
        run.state = "stopped";
        activeId = null;
        return run.id;
      },
      view() {
        return [...runs].reverse().map(viewRun);
      },
      snapshot() {
        return JSON.parse(JSON.stringify({ version: 1, runs }));
      }
    };
  }

  // shared/dg-usage-report.ts
  var DG_USAGE_REPORT_EVENT = "autobac-dg-usage-report";
  var DG_USAGE_REPORT_VERSION = 1;
  var dgUsageStopCodeSchema = external_exports.enum(["manual", "time_limit", "stop_loss", "take_profit", "stake_cap", "other"]);
  var safeNonNegativeInt = external_exports.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
  var safeSignedNumber = external_exports.number().finite().min(-Number.MAX_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER);
  var countSchema = external_exports.object({
    reserved: safeNonNegativeInt,
    submitted: safeNonNegativeInt,
    accepted: safeNonNegativeInt,
    settled: safeNonNegativeInt,
    uncertain: safeNonNegativeInt,
    rejected: safeNonNegativeInt,
    aborted: safeNonNegativeInt
  }).strict();
  var dgUsageReportSchema = external_exports.object({
    version: external_exports.literal(DG_USAGE_REPORT_VERSION),
    runId: external_exports.string().regex(RISK_EVENT_ID),
    settingsEventId: external_exports.string().regex(RISK_EVENT_ID),
    sequence: safeNonNegativeInt,
    // `interrupted` means a previously reportable page was rebuilt. It is deliberately
    // non-running: no end time or guessed stop reason is manufactured during recovery.
    status: external_exports.enum(["active", "stopped", "interrupted"]),
    stopCode: dgUsageStopCodeSchema.nullable(),
    startedAt: safeNonNegativeInt,
    updatedAt: safeNonNegativeInt,
    endedAt: safeNonNegativeInt.nullable(),
    elapsedMs: safeNonNegativeInt,
    durationMinutes: safeNonNegativeInt,
    eventCounts: countSchema,
    result: external_exports.object({
      settledPnl: safeSignedNumber,
      settledCount: safeNonNegativeInt,
      wins: safeNonNegativeInt,
      losses: safeNonNegativeInt,
      pendingCount: safeNonNegativeInt,
      uncertainCount: safeNonNegativeInt
    }).strict()
  }).strict().superRefine((report, ctx) => {
    if (report.runId.toLowerCase() !== report.settingsEventId.toLowerCase()) {
      ctx.addIssue({ code: "custom", path: ["settingsEventId"], message: "settingsEventId must equal runId" });
    }
    if (report.updatedAt < report.startedAt) {
      ctx.addIssue({ code: "custom", path: ["updatedAt"], message: "updatedAt must not precede startedAt" });
    }
    if ((report.status === "active" || report.status === "interrupted") && report.endedAt !== null) {
      ctx.addIssue({ code: "custom", path: ["endedAt"], message: "non-stopped reports cannot have endedAt" });
    }
    if ((report.status === "active" || report.status === "interrupted") && report.stopCode !== null) {
      ctx.addIssue({ code: "custom", path: ["stopCode"], message: "non-stopped reports cannot have stopCode" });
    }
    if (report.status === "stopped" && (report.endedAt === null || report.endedAt < report.startedAt)) {
      ctx.addIssue({ code: "custom", path: ["endedAt"], message: "stopped reports require a valid endedAt" });
    }
    if (report.status === "stopped" && report.stopCode === null) {
      ctx.addIssue({ code: "custom", path: ["stopCode"], message: "stopped reports require stopCode" });
    }
    if (report.result.settledCount > report.eventCounts.settled) {
      ctx.addIssue({ code: "custom", path: ["result", "settledCount"], message: "settled aggregate exceeds settled events" });
    }
    if (report.result.pendingCount > report.eventCounts.reserved + report.eventCounts.submitted + report.eventCounts.accepted) {
      ctx.addIssue({ code: "custom", path: ["result", "pendingCount"], message: "pending aggregate exceeds pending events" });
    }
    if (report.result.uncertainCount > report.eventCounts.uncertain + report.eventCounts.settled) {
      ctx.addIssue({ code: "custom", path: ["result", "uncertainCount"], message: "uncertain aggregate exceeds eligible events" });
    }
  });

  // lib/dg-bet-summary.ts
  function dgBetSummary(bets, names, since = 0) {
    const name = (bet) => names[bet.tableId] || bet.tableId;
    const uniqueNames = (rows) => [...new Set(rows.map(name))].join(" \xB7 ");
    const waiting = bets.filter((b) => b.state === "accepted" && !b.attributionUncertain);
    const confirming = bets.filter((b) => b.state === "reserved" || b.state === "submitted");
    const uncertain = bets.filter((b) => b.state === "uncertain" || b.attributionUncertain);
    const latest = /* @__PURE__ */ new Map();
    for (const bet of bets) {
      if (bet.attributionUncertain || !["accepted", "settled"].includes(bet.state) || bet.acceptedAt === void 0) continue;
      if (bet.state !== "accepted" && bet.acceptedAt < since) continue;
      const previous = latest.get(bet.tableId);
      if (!previous || bet.acceptedAt >= previous.acceptedAt) latest.set(bet.tableId, bet);
    }
    return {
      waiting: uniqueNames(waiting),
      confirming: uniqueNames(confirming),
      uncertain: uniqueNames(uncertain),
      success: [...latest.values()].map((b) => `${name(b)}${b.side}${b.amount.toLocaleString("zh-TW")}`).join(" \xB7 ")
    };
  }

  // lib/dg-panel-touch-scroll.ts
  function installDgPanelTouchScroll(root) {
    let state = null;
    const ownerWindow = root.ownerDocument.defaultView;
    function start(event) {
      state = null;
      if (event.touches.length !== 1) return;
      event.stopPropagation();
      const elements = event.composedPath().filter((node) => node instanceof ownerWindow.HTMLElement);
      const target = elements[0];
      if (!target || target.closest('#head,.resize-grip,input,textarea,select,[contenteditable="true"]')) return;
      const vertical = [], horizontal = [];
      for (const element of elements) {
        if (element === root.host) break;
        const style = ownerWindow.getComputedStyle(element);
        if (/auto|scroll/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1) vertical.push(element);
        if (/auto|scroll/.test(style.overflowX) && element.scrollWidth > element.clientWidth + 1) horizontal.push(element);
      }
      if (!vertical.length && !horizontal.length) return;
      const touch = event.touches[0];
      state = { x: touch.clientX, y: touch.clientY, lastX: touch.clientX, lastY: touch.clientY, vertical, horizontal, axis: null };
    }
    function move(event) {
      if (event.touches.length !== 1) {
        state = null;
        return;
      }
      event.stopPropagation();
      if (!state) return;
      const touch = event.touches[0];
      const dx = touch.clientX - state.x, dy = touch.clientY - state.y;
      if (!state.axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
        state.axis = Math.abs(dy) >= Math.abs(dx) ? "y" : "x";
      }
      const candidates = state.axis === "y" ? state.vertical : state.horizontal;
      if (!candidates.length) return;
      if (event.cancelable) event.preventDefault();
      let remaining = state.axis === "y" ? state.lastY - touch.clientY : state.lastX - touch.clientX;
      for (const element of candidates) {
        const scale = element.offsetHeight > 0 ? element.getBoundingClientRect().height / element.offsetHeight : 1;
        const divisor = scale > 0 ? scale : 1;
        const before = state.axis === "y" ? element.scrollTop : element.scrollLeft;
        if (state.axis === "y") element.scrollTop += remaining / divisor;
        else element.scrollLeft += remaining / divisor;
        const after = state.axis === "y" ? element.scrollTop : element.scrollLeft;
        remaining -= (after - before) * divisor;
        if (Math.abs(remaining) < 1) break;
      }
      state.lastX = touch.clientX;
      state.lastY = touch.clientY;
    }
    function end(event) {
      if (event.touches.length > 0) return;
      event.stopPropagation();
      if (state?.axis && event.cancelable) event.preventDefault();
      state = null;
    }
    root.addEventListener("touchstart", start, { passive: true });
    root.addEventListener("touchmove", move, { passive: false });
    root.addEventListener("touchend", end, { passive: false });
    root.addEventListener("touchcancel", end, { passive: false });
    return () => {
      root.removeEventListener("touchstart", start);
      root.removeEventListener("touchmove", move);
      root.removeEventListener("touchend", end);
      root.removeEventListener("touchcancel", end);
      state = null;
    };
  }

  // lib/dg-scene.ts
  function readDgSceneNodes(stage, maximum = 12e3) {
    const output = [], queue = [stage], queued = /* @__PURE__ */ new Set([stage]);
    let cursor = 0;
    const enqueue = (child) => {
      if (child && typeof child === "object" && !queued.has(child) && queue.length < maximum * 2) {
        queued.add(child);
        queue.push(child);
      }
    };
    while (cursor < queue.length && output.length < maximum) {
      const node = queue[cursor++];
      if (!node || typeof node !== "object" || node.destroyed) continue;
      output.push(node);
      try {
        const count = Math.min(1e3, Math.max(0, Number(node.numChildren) || 0));
        if (typeof node.getChildAt === "function") {
          for (let index = 0; index < count; index++) {
            try {
              enqueue(node.getChildAt(index));
            } catch {
            }
          }
        }
        if (Array.isArray(node._children)) for (const child of node._children.slice(0, 1e3)) enqueue(child);
      } catch {
      }
    }
    return output;
  }
  function dgSceneNodeVisible(node) {
    const seen = /* @__PURE__ */ new Set();
    while (node) {
      if (seen.has(node) || node.destroyed || node.visible === false || node.alpha === 0) return false;
      seen.add(node);
      node = node.parent;
    }
    return seen.size > 0;
  }
  function findDgScenePlayer(nodes) {
    for (const node of nodes) {
      for (const player of [node?.playerInfo, node]) {
        if (player && typeof player === "object" && typeof player.socketMan?.sendData === "function") return player;
      }
    }
    return null;
  }
  function dgSceneWallet(player) {
    if (!player || player.socketMan?.socket?.connected === false) return null;
    const value = player.balance;
    if (value === null || value === void 0 || value === "" || typeof value === "boolean") return null;
    const number4 = Number(value);
    return Number.isFinite(number4) && number4 >= 0 ? number4 : null;
  }
  function describeDgScene(nodes) {
    const candidates = nodes.filter((node) => node?.tableId != null && node?.gameInfo && (node?.betBtn || node?.betMoneyTmp));
    return {
      nodeCount: nodes.length,
      candidateCount: candidates.length,
      walletSynced: dgSceneWallet(findDgScenePlayer(nodes)) !== null,
      candidates: candidates.slice(0, 60).map((node) => {
        const mobile = !!node.betBtnMan && !node.betMan;
        const confirm = node.betMan?.confirm ?? node.betBtnMan?.confirmBtn;
        const cancel = node.betMan?.cancel ?? node.betBtnMan?.cancelBtn;
        const missing = [
          ["Banker", !!node.betBtn?.Banker],
          ["Player", !!node.betBtn?.Player],
          ["confirm", !!confirm],
          ["cancel", !!cancel],
          ["betMoneyTmp", !!node.betMoneyTmp],
          ["betMoneyTrue", !!node.betMoneyTrue],
          ["confirmBet", typeof node.confirmBet === "function"],
          ["socket", typeof node.playerInfo?.socketMan?.sendData === "function"],
          ["visible", dgSceneNodeVisible(node)]
        ].filter(([, exists]) => !exists).map(([name]) => name);
        return {
          tableId: String(node.tableId),
          table: String(node.gameInfo.tableName || ""),
          gameState: Number(node.gameInfo.stateId),
          roadCount: Array.isArray(node.gameInfo.roadArray) ? node.gameInfo.roadArray.length : 0,
          hasGameNo: !!node.gameInfo.gameNo,
          hasCountdown: node.gameInfo.countDown != null,
          profile: mobile ? "mobile-v329-shaped" : "desktop-shaped",
          betFlag: (mobile ? node.betBtnMan?.betFlag : node.betFlag) === true,
          missing
        };
      })
    };
  }

  // lib/poker-strategies.ts
  var rankNames = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  function cardRank(value) {
    if (typeof value === "string" && rankNames.includes(value.toUpperCase().trim())) return value.toUpperCase().trim();
    if (typeof value !== "number" && typeof value !== "string") return null;
    const n = Number(value);
    return Number.isInteger(n) && n >= 1 && n <= 52 ? rankNames[(n - 1) % 13] : null;
  }
  function baccaratValue(card) {
    const n = rankNames.indexOf(card) + 1;
    return n > 0 && n < 10 ? n : 0;
  }
  function handPoint(cards) {
    return cards.reduce((sum, c) => sum + baccaratValue(c), 0) % 10;
  }
  function completePoker(hand) {
    const { player: p, banker: b } = hand;
    if (p.length < 2 || p.length > 3 || b.length < 2 || b.length > 3 || ![...p, ...b].every((c) => rankNames.includes(c))) return false;
    const pp = handPoint(p.slice(0, 2)), bp = handPoint(b.slice(0, 2));
    if (pp >= 8 || bp >= 8) return p.length === 2 && b.length === 2;
    const pd = pp <= 5;
    if (p.length !== (pd ? 3 : 2)) return false;
    const third = pd ? baccaratValue(p[2]) : -1;
    const bd = !pd ? bp <= 5 : bp <= 2 || bp === 3 && third !== 8 || bp === 4 && third >= 2 && third <= 7 || bp === 5 && third >= 4 && third <= 7 || bp === 6 && (third === 6 || third === 7);
    return b.length === (bd ? 3 : 2);
  }
  function dgPokerHand(raw) {
    let data = raw;
    try {
      if (typeof raw === "string") data = JSON.parse(raw);
    } catch {
      return null;
    }
    if (!data || typeof data.player !== "string" || typeof data.banker !== "string") return null;
    const parse3 = (s) => {
      const values = s.split("-");
      if (values.length > 3 || values.some((v) => !v.trim())) return null;
      const ranks = values.map(cardRank);
      return ranks.every((r) => r !== null) ? ranks : null;
    };
    const player = parse3(data.player), banker = parse3(data.banker);
    if (!player || !banker) return null;
    const hand = { player, banker };
    return completePoker(hand) ? hand : null;
  }
  function pokerDecision(strategy, hand) {
    if (!hand || !completePoker(hand)) return { ok: false, reason: "\u7B49\u5F85\u540C\u684C\u540C\u9774\u4E0A\u4E00\u5C40\u5B8C\u6574\u5BE6\u969B\u724C\u5F35\uFF1B\u4E0D\u4EE5\u724C\u8DEF\u6216\u9EDE\u6578\u4EE3\u66FF" };
    const all = [...hand.player, ...hand.banker];
    if (strategy === "parity") {
      const values = all.map((c) => rankNames.indexOf(c) + 1), total = values.reduce((a, b) => a + b, 0);
      const first = Math.floor(total / 10) + total % 10, terminal = first >= 10 ? first % 10 : first;
      const side = terminal % 2 === 0 ? "\u838A" : "\u9592";
      return { ok: true, side, confidence: 0, reason: `\u7D42\u503C\u5947\u5076\uFF1A${all.join("\u3001")}\uFF1B\u724C\u9762\u7E3D\u548C ${total} \u2192 ${first} \u2192 ${terminal}\uFF1B${terminal % 2 === 0 ? "\u5076\u838A" : "\u5947\u9592"}\uFF08\u539F\u516C\u5F0F\uFF0C\u975E\u52DD\u7387\uFF09` };
    }
    const sum = all.reduce((n, c) => n + baccaratValue(c), 0), pb = handPoint(hand.banker), pp = handPoint(hand.player);
    const votes = [sum % 3 === 0 ? "\u838A" : "\u9592", sum % 2 === 0 ? "\u838A" : "\u9592", pb * pp % 2 === 0 ? "\u838A" : "\u9592", (pb + pp) % 2 === 0 ? "\u838A" : "\u9592"];
    const bankers = votes.filter((v) => v === "\u838A").length;
    const reason = `V38\u56DB\u5F0F\uFF1AA ${votes[0]}\uFF0FB ${votes[1]}\uFF0F\u4E58 ${votes[2]}\uFF0F\u52A0 ${votes[3]}\uFF1B\u838A ${bankers}\uFF1A\u9592 ${4 - bankers}\uFF08\u539F\u516C\u5F0F\uFF0C\u975E\u5269\u724C\u6A5F\u7387\uFF09`;
    if (bankers === 2) return { ok: false, reason: reason + "\uFF1B\u540C\u7968\u89C0\u671B\uFF0C\u4E0D\u4E0B\u6CE8" };
    return { ok: true, side: bankers > 2 ? "\u838A" : "\u9592", confidence: Math.max(bankers, 4 - bankers) * 25, reason };
  }
  function createDgPokerTracker() {
    const snapshots = /* @__PURE__ */ new Map();
    function observe(cards) {
      for (const card of cards) {
        const id = String(card.tableId || ""), g = card.gameInfo || {}, shoe = g.shoeId == null ? "" : String(g.shoeId), round = Number(g.playId);
        if (!id || !shoe || !Number.isSafeInteger(round) || round < 1) continue;
        const old = snapshots.get(id);
        if (old && (old.shoe !== shoe || round < old.round)) snapshots.delete(id);
        if (Number(g.stateId) === 1) continue;
        const hand = dgPokerHand(g.poker);
        if (!hand) continue;
        const fingerprint = JSON.stringify(hand), previous = snapshots.get(id);
        if (previous && previous.shoe === shoe && previous.round === round) {
          if (previous.fingerprint !== fingerprint) previous.conflict = true;
          continue;
        }
        snapshots.set(id, { shoe, round, hand, fingerprint, conflict: false });
      }
    }
    function decision(card, strategy) {
      const g = card?.gameInfo || {}, old = snapshots.get(String(card?.tableId || ""));
      if (!old || old.conflict || old.shoe !== String(g.shoeId ?? "") || old.round !== Number(g.playId) - 1) return pokerDecision(strategy, null);
      return pokerDecision(strategy, old.hand);
    }
    return { observe, decision };
  }

  // lib/dg-bet-ledger.ts
  function martingaleAmount(base, level) {
    if (!Number.isSafeInteger(base) || base <= 0 || !Number.isInteger(level) || level < 0 || level > 30) throw new Error("\u57FA\u672C\u91D1\u984D\uFF0F\u968E\u7D1A\u7121\u6548");
    const amount = base * (2 ** (level + 1) - 1);
    if (!Number.isSafeInteger(amount)) throw new Error("\u99AC\u4E01\u91D1\u984D\u8D85\u51FA\u6574\u6578\u7BC4\u570D");
    return amount;
  }
  function doublingAmount(base, level) {
    if (!Number.isSafeInteger(base) || base <= 0 || !Number.isInteger(level) || level < 0 || level > 30) throw Error("\u57FA\u672C\u91D1\u984D\uFF0F\u968E\u7D1A\u7121\u6548");
    const amount = base * 2 ** level;
    if (!Number.isSafeInteger(amount)) throw Error("\u500D\u6295\u91D1\u984D\u8D85\u51FA\u6574\u6578\u7BC4\u570D");
    return amount;
  }
  function stakingAmount(base, level, staking) {
    return staking === "doubling" ? doublingAmount(base, level) : martingaleAmount(base, staking === "flat" ? 0 : level);
  }
  var DgBetLedger = class {
    state;
    constructor(saved) {
      this.state = saved?.version === 1 ? JSON.parse(JSON.stringify(saved)) : { version: 1, levels: {}, bets: [] };
    }
    levelKey(tableId, scope) {
      return scope === "global" ? "global" : `table:${tableId}`;
    }
    level(tableId, scope) {
      return this.state.levels[this.levelKey(tableId, scope)] ?? 0;
    }
    pending() {
      return this.state.bets.filter((b) => ["reserved", "submitted", "accepted", "uncertain"].includes(b.state));
    }
    resetLevels() {
      if (this.pending().length) throw new Error("\u4ECD\u6709\u5F85\u63A5\u53D7\uFF0F\u5F85\u7D50\u7B97\u6216\u672A\u78BA\u5B9A\u4E0B\u6CE8\uFF0C\u4E0D\u80FD\u91CD\u8A2D\u914D\u6CE8\u968E\u7D1A");
      this.state.levels = {};
    }
    reserve(tableId, gameNo, side, base, scope, staking = "martingale") {
      const key = `${tableId}:${gameNo}`;
      if (!tableId || !gameNo || this.state.bets.some((b) => b.key === key)) throw new Error("\u5C40\u865F\u7F3A\u5931\u6216\u672C\u5C40\u5DF2\u64CD\u4F5C");
      if (this.pending().some((b) => scope === "global" || b.scope === "global" || b.tableId === tableId)) throw new Error("\u4E0A\u4E00\u7B14\u4ECD\u5F85\u7D50\u7B97");
      const level = this.level(tableId, scope);
      const amount = stakingAmount(base, level, staking);
      const bet = { key, tableId, gameNo, side, amount, level, scope, staking, state: "reserved", createdAt: Date.now() };
      this.state.bets.push(bet);
      return bet;
    }
    submit(bet) {
      if (bet.state !== "reserved") throw new Error("\u4E0B\u6CE8\u72C0\u614B\u932F\u8AA4");
      bet.state = "submitted";
      bet.submittedAt = Date.now();
    }
    abort(bet) {
      if (bet.state === "reserved") bet.state = "aborted";
    }
    uncertain(bet) {
      if (bet.state === "submitted") bet.state = "uncertain";
    }
    receipt(msg) {
      if (Number(msg?.cmd) !== 6 || !msg.gameNo || msg.tableId == null) return null;
      const bet = this.state.bets.find((b) => b.key === `${msg.tableId}:${msg.gameNo}` && ["submitted", "uncertain"].includes(b.state));
      if (!bet) return null;
      if (bet.attributionUncertain) {
        bet.state = "uncertain";
        return { bet, accepted: false };
      }
      if (msg.codeId == null) {
        bet.state = "uncertain";
        return { bet, accepted: false };
      }
      if (Number(msg.codeId) !== 0) {
        bet.state = "rejected";
        return { bet, accepted: false };
      }
      let info;
      try {
        info = JSON.parse(msg.list?.[0] ?? "");
      } catch {
        bet.state = "uncertain";
        return { bet, accepted: false };
      }
      const banker = Number(info.banker ?? 0) + Number(info.banker6 ?? 0), player = Number(info.player ?? 0);
      const total = banker + player + Number(info.tie ?? 0) + Number(info.bPair ?? 0) + Number(info.pPair ?? 0);
      if ((bet.side === "\u838A" ? banker : player) !== bet.amount || total !== bet.amount) {
        bet.state = "uncertain";
        return { bet, accepted: false };
      }
      bet.state = "accepted";
      bet.acceptedAt = Date.now();
      return { bet, accepted: true };
    }
    settle(msg) {
      if (Number(msg?.cmd) !== 1007 || Number(msg.codeId ?? 0) !== 0 || !msg.gameNo || msg.tableId == null) return null;
      const bet = this.state.bets.find((b) => b.key === `${msg.tableId}:${msg.gameNo}` && b.state === "accepted" && !b.attributionUncertain);
      const pnl = msg.dList?.[1];
      if (!bet || typeof pnl !== "number" || !Number.isFinite(pnl)) return null;
      const k = this.levelKey(bet.tableId, bet.scope);
      if (bet.staking !== "flat") this.state.levels[k] = pnl > 0 ? 0 : pnl < 0 ? bet.level + 1 : bet.level;
      bet.pnl = pnl;
      bet.state = "settled";
      bet.settledAt = Date.now();
      return { bet, pnl, nextLevel: this.state.levels[k] ?? 0 };
    }
  };

  // lib/road-render.ts
  var cellKey = (col, row) => `${col}:${row}`;
  function buildBigRoadState(results) {
    const marks = [];
    const columns = [];
    const occupied = /* @__PURE__ */ new Set();
    let previous = null;
    let logicalCol = -1;
    let baseDisplayCol = -1;
    let last = null;
    let turned = false;
    let tailRow = 0;
    let pendingTies = 0;
    for (const raw of results) {
      if (raw === "\u548C") {
        if (last) last.tieCount = (last.tieCount ?? 0) + 1;
        else pendingTies += 1;
        continue;
      }
      const result = raw;
      const newColumn = result !== previous;
      let row = 0;
      let col = 0;
      let logicalRow = 0;
      if (newColumn) {
        logicalCol += 1;
        logicalRow = 0;
        columns[logicalCol] = { result, length: 1 };
        baseDisplayCol += 1;
        while (occupied.has(cellKey(baseDisplayCol, 0))) baseDisplayCol += 1;
        col = baseDisplayCol;
        row = 0;
        turned = false;
        tailRow = 0;
      } else {
        logicalRow = columns[logicalCol]?.length ?? 1;
        columns[logicalCol].length = logicalRow + 1;
        if (!last) {
          col = Math.max(0, baseDisplayCol);
          row = 0;
        } else if (turned) {
          row = tailRow;
          col = last.col + 1;
          while (occupied.has(cellKey(col, row))) col += 1;
        } else {
          const downRow = last.row + 1;
          if (downRow <= 5 && !occupied.has(cellKey(last.col, downRow))) {
            col = last.col;
            row = downRow;
          } else {
            turned = true;
            tailRow = last.row;
            row = tailRow;
            col = last.col + 1;
            while (occupied.has(cellKey(col, row))) col += 1;
          }
        }
      }
      const mark = {
        row,
        col,
        result,
        logicalCol,
        logicalRow,
        isNewColumn: newColumn
      };
      if (pendingTies) {
        mark.tieCount = pendingTies;
        pendingTies = 0;
      }
      marks.push(mark);
      occupied.add(cellKey(col, row));
      last = mark;
      previous = result;
    }
    return { marks, columns };
  }
  function placeDerived(sequence, filled) {
    const marks = [];
    const occupied = /* @__PURE__ */ new Set();
    let previous = null;
    let baseCol = -1;
    let last = null;
    let turned = false;
    let tailRow = 0;
    for (const result of sequence) {
      if (!last || result !== previous) {
        baseCol += 1;
        while (occupied.has(cellKey(baseCol, 0))) baseCol += 1;
        const m2 = { row: 0, col: baseCol, result, filled };
        marks.push(m2);
        occupied.add(cellKey(m2.col, m2.row));
        last = m2;
        previous = result;
        turned = false;
        tailRow = 0;
        continue;
      }
      let row, col;
      if (turned) {
        row = tailRow;
        col = last.col + 1;
        while (occupied.has(cellKey(col, row))) col += 1;
      } else {
        const down = last.row + 1;
        if (down <= 5 && !occupied.has(cellKey(last.col, down))) {
          row = down;
          col = last.col;
        } else {
          turned = true;
          tailRow = last.row;
          row = tailRow;
          col = last.col + 1;
          while (occupied.has(cellKey(col, row))) col += 1;
        }
      }
      const m = { row, col, result, filled };
      marks.push(m);
      occupied.add(cellKey(col, row));
      last = m;
    }
    return marks;
  }
  function buildDerivedRoad(results, offset, filled) {
    const { marks, columns } = buildBigRoadState(results);
    const colors = [];
    for (const mark of marks) {
      const c = mark.logicalCol ?? 0;
      const r = mark.logicalRow ?? 0;
      let color = null;
      if (r === 0) {
        const a = c - 1;
        const b = c - offset - 1;
        if (b >= 0) color = columns[a]?.length === columns[b]?.length ? "\u838A" : "\u9592";
      } else {
        const ref = c - offset;
        if (ref >= 0) {
          const len = columns[ref]?.length ?? 0;
          const sameRowOccupied = len > r;
          const aboveOccupied = len > r - 1;
          color = sameRowOccupied === aboveOccupied ? "\u838A" : "\u9592";
        }
      }
      if (color) colors.push(color);
    }
    return placeDerived(colors, filled);
  }
  function nextDerivedColor(results, outcome, offset, filled) {
    const before = buildDerivedRoad(results, offset, filled);
    const after = buildDerivedRoad([...results, outcome], offset, filled);
    return after.length > before.length ? after.at(-1)?.result ?? null : null;
  }
  function buildAskRoad(results) {
    const predict = (outcome) => ({
      bigEye: nextDerivedColor(results, outcome, 1, false),
      small: nextDerivedColor(results, outcome, 2, true),
      cockroach: nextDerivedColor(results, outcome, 3, false)
    });
    return { banker: predict("\u838A"), player: predict("\u9592") };
  }

  // lib/dg-original-ai.ts
  var AI_PROVIDER_OPTIONS = [
    { key: "chatgpt", label: "ChatGPT" },
    { key: "gemini", label: "Gemini" },
    { key: "grok", label: "Grok" },
    { key: "meta", label: "Meta AI" },
    { key: "combined", label: "AI\u7D9C\u5408" },
    { key: "road", label: "\u724C\u8DEF\u7B56\u7565" }
  ];
  AI_PROVIDER_OPTIONS.push({ key: "counting", label: "V38 \u56DB\u5F0F\u7B97\u724C" }, { key: "parity", label: "\u5947\u5076\u7B56\u7565" });
  function roadSides(results) {
    return results.filter((r) => r === "\u838A" || r === "\u9592");
  }
  function columnRuns(results) {
    const seq = roadSides(results);
    const runs = [];
    for (const side of seq) {
      const last = runs[runs.length - 1];
      if (last?.side === side) last.length += 1;
      else runs.push({ side, length: 1 });
    }
    return runs;
  }
  function tailAlternating(runs, size, len) {
    if (runs.length < size) return false;
    const x = runs.slice(-size);
    return x.every((r) => r.length === len) && x.every((r, i) => i === 0 || r.side !== x[i - 1].side);
  }
  function getPatternInfo(results) {
    const seq = roadSides(results);
    const runs = columnRuns(results);
    if (seq.length < 3 || !runs.length)
      return { type: "\u8CC7\u6599\u7D2F\u7A4D\u4E2D", label: "\u8CC7\u6599\u7D2F\u7A4D\u4E2D" };
    const lastRun = runs[runs.length - 1];
    if (lastRun.length >= 4)
      return {
        type: "\u9023\u9F8D",
        label: `${lastRun.side}\u9F8D${lastRun.length}\u9846`,
        side: lastRun.side,
        run: lastRun.length
      };
    if (tailAlternating(runs, 4, 1))
      return { type: "\u55AE\u8DF3", label: "\u55AE\u8DF3", side: lastRun.side };
    if (tailAlternating(runs, 3, 2))
      return { type: "\u96D9\u8DF3", label: "\u96D9\u8DF3", side: lastRun.side };
    if (runs.length >= 6) {
      const x = runs.slice(-6);
      const twoPlayerOneBanker = x[0].side === "\u9592" && x[0].length === 2 && x[1].side === "\u838A" && x[1].length === 1 && x[2].side === "\u9592" && x[2].length === 2 && x[3].side === "\u838A" && x[3].length === 1 && x[4].side === "\u9592" && x[4].length === 2 && x[5].side === "\u838A" && x[5].length === 1;
      const twoBankerOnePlayer = x[0].side === "\u838A" && x[0].length === 2 && x[1].side === "\u9592" && x[1].length === 1 && x[2].side === "\u838A" && x[2].length === 2 && x[3].side === "\u9592" && x[3].length === 1 && x[4].side === "\u838A" && x[4].length === 2 && x[5].side === "\u9592" && x[5].length === 1;
      if (twoPlayerOneBanker)
        return { type: "\u4E00\u623F\u5169\u5EF3", label: "\u5169\u9592\u4E00\u838A", side: "\u9592" };
      if (twoBankerOnePlayer)
        return { type: "\u4E00\u623F\u5169\u5EF3", label: "\u5169\u838A\u4E00\u9592", side: "\u838A" };
    }
    if (lastRun.length >= 2)
      return {
        type: "\u4E00\u822C\u9023",
        label: `${lastRun.side}\u9023${lastRun.length}`,
        side: lastRun.side,
        run: lastRun.length
      };
    return { type: "\u6DF7\u5408", label: "\u8F49\u578B\uFF0F\u6DF7\u5408\u8DEF", side: lastRun.side };
  }
  function derivedTailPreference(results, offset) {
    const marks = buildDerivedRoad(results, offset, offset === 2);
    if (!marks.length) return null;
    const seq = marks.map((m) => m.result).filter((r) => r === "\u838A" || r === "\u9592");
    if (!seq.length) return null;
    const last = seq[seq.length - 1];
    let run = 1;
    for (let i = seq.length - 2; i >= 0 && seq[i] === last; i--) run++;
    if (run >= 2) return last;
    if (seq.length >= 4) {
      const x = seq.slice(-4);
      if (x[0] !== x[1] && x[1] !== x[2] && x[2] !== x[3])
        return last === "\u838A" ? "\u9592" : "\u838A";
    }
    const tail = seq.slice(-8);
    let same = 0, change = 0;
    for (let i = 1; i < tail.length; i++)
      tail[i] === tail[i - 1] ? same++ : change++;
    return change > same ? last === "\u838A" ? "\u9592" : "\u838A" : last;
  }
  function roadDecision(results) {
    const seq = roadSides(results);
    if (!seq.length)
      return {
        side: "\u838A",
        scoreBanker: 0,
        scorePlayer: 0,
        reason: "\u7B49\u5F85\u724C\u8DEF\u8CC7\u6599"
      };
    const info = getPatternInfo(results);
    const ask = buildAskRoad(results);
    const prefs = [
      derivedTailPreference(results, 1),
      derivedTailPreference(results, 2),
      derivedTailPreference(results, 3)
    ];
    const bankerAsk = [ask.banker.bigEye, ask.banker.small, ask.banker.cockroach];
    const playerAsk = [ask.player.bigEye, ask.player.small, ask.player.cockroach];
    let b = 0, p = 0;
    prefs.forEach((pref, i) => {
      if (!pref) return;
      if (bankerAsk[i] === pref) b += 2;
      if (playerAsk[i] === pref) p += 2;
    });
    const runs = columnRuns(results);
    const last = seq[seq.length - 1];
    if (info.type === "\u9023\u9F8D") {
      if (last === "\u838A") b += 4;
      else p += 4;
    } else if (info.type === "\u55AE\u8DF3") {
      if (last === "\u838A") p += 4;
      else b += 4;
    } else if (info.type === "\u96D9\u8DF3") {
      if (last === "\u838A") b += 4;
      else p += 4;
    } else if (info.type === "\u4E00\u623F\u5169\u5EF3" && info.side) {
      if (info.side === "\u838A") b += 3;
      else p += 3;
    } else if (info.type === "\u4E00\u822C\u9023") {
      if (last === "\u838A") b += 2;
      else p += 2;
    }
    const recentRuns = runs.slice(-10);
    const bankerDepth = recentRuns.filter((r) => r.side === "\u838A").reduce((s, r) => s + r.length, 0);
    const playerDepth = recentRuns.filter((r) => r.side === "\u9592").reduce((s, r) => s + r.length, 0);
    if (bankerDepth > playerDepth) b += 0.5;
    else if (playerDepth > bankerDepth) p += 0.5;
    const side = b === p ? last === "\u838A" ? "\u9592" : "\u838A" : b > p ? "\u838A" : "\u9592";
    const fmt = (x) => x === "\u838A" ? "\u7D05" : x === "\u9592" ? "\u85CD" : "\u2014";
    return {
      side,
      scoreBanker: b,
      scorePlayer: p,
      reason: `${info.label}\uFF5C\u838A\u554F\u8DEF ${bankerAsk.map(fmt).join("\u30FB")}\uFF5C\u9592\u554F\u8DEF ${playerAsk.map(fmt).join("\u30FB")}\uFF5C\u4E09\u8DEF\u7D9C\u5408 ${b.toFixed(1)}:${p.toFixed(1)}`
    };
  }
  function confidencePercent(scoreBanker, scorePlayer) {
    const gap = Math.abs(scoreBanker - scorePlayer);
    return Math.max(0, Math.min(100, Math.round(gap / 6 * 100)));
  }
  function roadBasedConfidence(results, recommendedSide, originalConfidence = 60) {
    const seq = roadSides(results);
    if (seq.length < 3) return 40;
    const recent = seq.slice(-10);
    const recent6 = seq.slice(-6);
    const last = seq[seq.length - 1];
    let streak = 1;
    for (let i = seq.length - 2; i >= 0 && seq[i] === last; i--) streak += 1;
    let changes = 0;
    for (let i = 1; i < recent6.length; i++) if (recent6[i] !== recent6[i - 1]) changes += 1;
    const altRate = recent6.length > 1 ? changes / (recent6.length - 1) : 0.5;
    const info = getPatternInfo(results);
    let score = 52;
    if (info.type === "\u9023\u9F8D") score += 15;
    else if (info.type === "\u55AE\u8DF3") score += 14;
    else if (info.type === "\u96D9\u8DF3") score += 13;
    else if (info.type === "\u4E00\u623F\u5169\u5EF3") score += 10;
    else if (info.type === "\u4E00\u822C\u9023") score += 6;
    else score -= 8;
    if (altRate >= 0.82 || altRate <= 0.18) score += 9;
    else if (altRate >= 0.35 && altRate <= 0.65) score -= 7;
    if (streak >= 5) score += 9;
    else if (streak >= 3) score += 5;
    const prefs = [
      derivedTailPreference(results, 1),
      derivedTailPreference(results, 2),
      derivedTailPreference(results, 3)
    ].filter((x) => x === "\u838A" || x === "\u9592");
    if (prefs.length >= 2) {
      const bankerVotes = prefs.filter((x) => x === "\u838A").length;
      const playerVotes = prefs.length - bankerVotes;
      const majority = bankerVotes === playerVotes ? null : bankerVotes > playerVotes ? "\u838A" : "\u9592";
      if (bankerVotes === prefs.length || playerVotes === prefs.length) score += 8;
      else if (majority) score += 3;
      else score -= 4;
      if (majority === recommendedSide) score += 5;
      else if (majority) score -= 4;
    }
    const roadSide = roadDecision(results).side;
    score += roadSide === recommendedSide ? 6 : -5;
    score += Math.round((Math.max(35, Math.min(95, originalConfidence)) - 60) * 0.22);
    const b = recent.filter((x) => x === "\u838A").length;
    const p = recent.length - b;
    if (recent.length >= 8 && Math.abs(b - p) <= 1 && altRate > 0.2 && altRate < 0.8) score -= 5;
    return Math.max(35, Math.min(95, Math.round(score)));
  }
  function providerAnalysisText(provider, table) {
    if (!table) return `\u3010${AI_PROVIDER_OPTIONS.find((x) => x.key === provider)?.label ?? "AI"}\u3011\u7B49\u5F85\u724C\u5C40\u8CC7\u6599\u3002`;
    const seq = roadSides(table.results);
    const label = AI_PROVIDER_OPTIONS.find((x) => x.key === provider)?.label ?? "AI";
    if (seq.length < 3) return `\u3010${label}\u3011\u76EE\u524D\u8CC7\u6599\u7D2F\u7A4D\u4E2D\uFF0C\u7B2C\u4E09\u9846\u958B\u59CB\u5224\u65B7\u724C\u578B\u3002`;
    const info = getPatternInfo(table.results);
    const ask = buildAskRoad(table.results);
    const prefs = [
      derivedTailPreference(table.results, 1),
      derivedTailPreference(table.results, 2),
      derivedTailPreference(table.results, 3)
    ];
    const colorName = (x) => x === "\u838A" ? "\u7D05" : x === "\u9592" ? "\u85CD" : "\u2014";
    const prefName = (x) => x === "\u838A" ? "\u504F\u7D05" : x === "\u9592" ? "\u504F\u85CD" : "\u8CC7\u6599\u4E0D\u8DB3";
    const bankerAsk = [ask.banker.bigEye, ask.banker.small, ask.banker.cockroach];
    const playerAsk = [ask.player.bigEye, ask.player.small, ask.player.cockroach];
    const local = localProviderDecision(provider, table.results ?? []);
    const road = roadSides(table.results);
    const recent = road.slice(-12);
    const recentBanker = recent.filter((x) => x === "\u838A").length;
    const recentPlayer = recent.filter((x) => x === "\u9592").length;
    const last = road.at(-1);
    let streak = 0;
    if (last) for (let i = road.length - 1; i >= 0 && road[i] === last; i -= 1) streak += 1;
    let changes = 0;
    for (let i = Math.max(1, road.length - 8); i < road.length; i += 1) if (road[i] !== road[i - 1]) changes += 1;
    const roadLineByProvider = {
      chatgpt: `\u3010\u5927\u8DEF\u3011${info.label}\uFF0C\u8FD1\u6BB5\u7BC0\u594F${changes >= 5 ? "\u5207\u63DB\u8F03\u5BC6" : streak >= 3 ? "\u9023\u7E8C\u6027\u8F03\u5F37" : "\u504F\u6DF7\u5408"}\u3002`,
      gemini: `\u3010\u5927\u8DEF\u3011${info.label}\uFF0C\u76EE\u524D\u7D50\u69CB\u4EE5${streak >= 3 ? "\u77ED\u9F8D\u5EF6\u7E8C" : changes >= 5 ? "\u55AE\u8DF3\uFF0F\u8F49\u6298" : "\u6DF7\u5408\u6BB5"}\u70BA\u4E3B\u3002`,
      grok: `\u3010\u5927\u8DEF\u3011${info.label}\uFF0C\u77ED\u7DDA\u6700\u8FD1${Math.min(6, road.length)}\u624B${changes >= 4 ? "\u5207\u63DB\u983B\u7E41" : "\u52D5\u80FD\u8F03\u96C6\u4E2D"}\u3002`,
      meta: `\u3010\u5927\u8DEF\u3011${info.label}\uFF0C\u8FD112\u624B\u838A${recentBanker}\uFF0F\u9592${recentPlayer}\uFF0C\u5206\u5E03${Math.abs(recentBanker - recentPlayer) <= 2 ? "\u63A5\u8FD1" : "\u5DF2\u6709\u504F\u5411"}\u3002`,
      combined: `\u3010\u5927\u8DEF\u3011${info.label}\uFF0C\u56DB\u7A2E\u89D2\u5EA6\u7D9C\u5408\u6BD4\u5C0D\u76EE\u524D\u7BC0\u594F\u3001\u7D50\u69CB\u8207\u5206\u5E03\u3002`,
      road: `\u3010\u5927\u8DEF\u3011${info.label}\u3002`
    };
    const finishByProvider = {
      chatgpt: `\u3010\u7D9C\u5408\u3011\u4F9D\u8FD1\u671F\u7BC0\u594F\u3001\u9023\u7E8C\u6027\u8207\u8F49\u6298\u5224\u65B7\uFF0C\u672C\u5C40\u63A8\u85A6${local.side}\u3002`,
      gemini: `\u3010\u7D50\u69CB\u3011\u4F9D\u5927\u8DEF\u7D50\u69CB\u3001\u55AE\u8DF3\uFF0F\u77ED\u9F8D\u8207\u8F49\u6298\u4F4D\u7F6E\u5224\u65B7\uFF0C\u672C\u5C40\u63A8\u85A6${local.side}\u3002`,
      grok: `\u3010\u77ED\u7DDA\u3011\u4F9D\u6700\u8FD1\u5E7E\u624B\u52D5\u80FD\u8207\u5207\u63DB\u901F\u5EA6\u5224\u65B7\uFF0C\u672C\u5C40\u63A8\u85A6${local.side}\u3002`,
      meta: `\u3010\u6BD4\u4F8B\u3011\u4F9D\u8FD1\u671F\u838A\u9592\u5206\u5E03\u3001\u504F\u79FB\u8207\u56DE\u88DC\u689D\u4EF6\u5224\u65B7\uFF0C\u672C\u5C40\u63A8\u85A6${local.side}\u3002`,
      combined: (() => {
        const parts = ["chatgpt", "gemini", "grok", "meta"].map((x) => ({ key: x, ...localProviderDecision(x, table.results ?? []) }));
        const b = parts.filter((x) => x.side === "\u838A").length;
        const pl = parts.filter((x) => x.side === "\u9592").length;
        return `\u3010\u7D9C\u5408\u3011ChatGPT ${parts[0].side}\uFF0FGemini ${parts[1].side}\uFF0FGrok ${parts[2].side}\uFF0FMeta AI ${parts[3].side}\uFF1B\u838A${b}\uFF1A\u9592${pl}\uFF0C\u672C\u5C40\u63A8\u85A6${local.side}\u3002`;
      })(),
      road: `\u3010\u7D9C\u5408\u3011\u4F9D\u5927\u8DEF\u3001\u4E0B\u4E09\u8DEF\u8207\u838A\u9592\u554F\u8DEF\u7D9C\u5408\u5224\u65B7\uFF0C\u672C\u5C40\u63A8\u85A6${local.side}\u3002`
    };
    return [
      `\u3010${label}\u3011`,
      roadLineByProvider[provider],
      `\u3010\u5927\u773C\u4ED4\u3011${prefName(prefs[0])}\uFF1B\u3010\u5C0F\u8DEF\u3011${prefName(prefs[1])}\uFF1B\u3010\u66F1\u7534\u8DEF\u3011${prefName(prefs[2])}\u3002`,
      `\u3010\u838A\u554F\u8DEF\u3011${bankerAsk.map(colorName).join("\u30FB")}\uFF1B\u3010\u9592\u554F\u8DEF\u3011${playerAsk.map(colorName).join("\u30FB")}\u3002`,
      finishByProvider[provider]
    ].join("\n");
  }
  function localProviderDecision(provider, results) {
    const road = roadSides(results);
    const base = roadDecision(results);
    const fallback = base.side;
    const value = (x) => x === "\u838A" ? 1 : x === "\u9592" ? -1 : 0;
    const weighted = (take) => {
      const arr = road.slice(-take);
      return arr.reduce((sum, x, i) => sum + value(x) * (1 + i / Math.max(1, arr.length - 1) * 1.7), 0);
    };
    const distribution = (take) => road.slice(-take).reduce((sum, x) => sum + value(x), 0);
    const alternation = (take) => {
      const arr = road.slice(-take);
      if (arr.length < 2) return 0;
      let changes = 0;
      for (let i = 1; i < arr.length; i += 1) if (arr[i] !== arr[i - 1]) changes += 1;
      return changes / (arr.length - 1);
    };
    const last = road.at(-1);
    const opposite = (x) => x === "\u838A" ? "\u9592" : "\u838A";
    let streak = 0;
    if (last) {
      for (let i = road.length - 1; i >= 0 && road[i] === last; i -= 1) streak += 1;
    }
    const pick2 = (score, tie) => Math.abs(score) < 0.5 ? tie : score > 0 ? "\u838A" : "\u9592";
    const finalize2 = (side2, rawConfidence2) => ({
      side: side2,
      confidence: roadBasedConfidence(results, side2, rawConfidence2)
    });
    if (provider === "road") {
      return finalize2(base.side, confidencePercent(base.scoreBanker, base.scorePlayer));
    }
    if (provider === "chatgpt") {
      const score = weighted(12) * 0.34 + (streak >= 2 ? value(last) * Math.min(2, streak * 0.5) : 0) + (alternation(10) >= 0.78 ? -value(last) * 0.75 : 0);
      return finalize2(pick2(score, fallback), Math.max(45, Math.min(92, 58 + Math.round(Math.abs(score) * 4))));
    }
    if (provider === "gemini") {
      let score = (1 - alternation(6)) * distribution(14) * 0.2;
      if (last && alternation(6) >= 0.72) score += -value(last) * 1.55;
      if (streak === 2 || streak === 3) score += value(last) * 0.9;
      if (streak >= 5) score -= value(last) * 0.55;
      const tie = last && alternation(6) >= 0.67 ? opposite(last) : fallback;
      return finalize2(pick2(score, tie), Math.max(44, Math.min(90, 56 + Math.round(Math.abs(score) * 5))));
    }
    if (provider === "grok") {
      let score = weighted(5) * 0.7 + weighted(3) * 0.38;
      if (streak >= 2) score += value(last) * Math.min(1.45, streak * 0.42);
      if (last && alternation(5) >= 0.8) score -= value(last) * 0.55;
      return finalize2(pick2(score, weighted(4) >= 0 ? "\u838A" : "\u9592"), Math.max(46, Math.min(93, 60 + Math.round(Math.abs(score) * 3))));
    }
    if (provider === "meta") {
      const longDist = distribution(18), shortDist = distribution(8);
      let score = -longDist * 0.2 - shortDist * 0.28;
      if (Math.abs(longDist) <= 2) score += shortDist * 0.12;
      if (streak >= 4) score -= value(last) * 1.25;
      const tie = Math.abs(distribution(12)) >= 2 ? distribution(12) > 0 ? "\u9592" : "\u838A" : opposite(last);
      return finalize2(pick2(score, tie), Math.max(43, Math.min(88, 55 + Math.round(Math.abs(score) * 4))));
    }
    const parts = ["chatgpt", "gemini", "grok", "meta"].map((x) => localProviderDecision(x, results));
    const banker = parts.filter((x) => x.side === "\u838A");
    const player = parts.filter((x) => x.side === "\u9592");
    const bWeight = banker.reduce((s, x) => s + x.confidence, 0);
    const pWeight = player.reduce((s, x) => s + x.confidence, 0);
    const side = banker.length === player.length ? bWeight >= pWeight ? "\u838A" : "\u9592" : banker.length > player.length ? "\u838A" : "\u9592";
    const winners = parts.filter((x) => x.side === side);
    const rawConfidence = Math.round(winners.reduce((s, x) => s + x.confidence, 0) / Math.max(1, winners.length));
    return finalize2(side, rawConfidence);
  }

  // lib/dg-panel-mobile-layout.ts
  var DG_MOBILE_LAYOUT_CSS = `
.session-time{display:flex;justify-content:space-between;gap:5px;flex:none;padding:5px 0;font-size:9px;color:#b5c4bd;line-height:1.4;flex-wrap:wrap}.session-time strong{font-variant-numeric:tabular-nums;color:#e8dcc1}.session-time>span:last-child{margin-left:auto}
/* Applied last for both platforms. Content must not disappear behind a fixed footer. */
:host{touch-action:pan-x pan-y}
#overview-page,#settings-page,#logs-page,#rooms-page,.report-scroll,#events{touch-action:pan-y;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
#table-strip{touch-action:pan-x;-webkit-overflow-scrolling:touch}
#panel.compact:not(.mini) #overview-page{overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
#panel.compact.mini{width:210px;height:auto;min-height:228px;max-height:none;padding:9px;overflow:visible}
#panel.compact.mini #overview-page{flex:none;height:auto;min-height:0;overflow:visible;gap:5px}
#panel.compact.mini .hero{height:auto;min-height:0;max-height:none;padding:0;flex:none}
#panel.compact.mini #target-box{height:auto;min-height:0;flex:none}
#panel.compact.mini .mini-context{height:auto;min-height:18px;flex-wrap:wrap;gap:3px;font-size:9px}
#panel.compact.mini .mini-context>span:last-child{margin-left:auto;font-variant-numeric:tabular-nums}
#panel.compact.mini .roomline{height:auto;min-height:17px;flex-wrap:wrap;gap:4px}
#panel.compact.mini .bet-main{height:auto;min-height:39px;margin:3px 0}
#panel.compact.mini .meta{display:block;height:auto;min-height:0;white-space:normal;overflow:visible;line-height:1.35;font-size:9px;margin:3px 0}
#panel.compact.mini #hero-status{display:block;height:auto;min-height:0;max-height:none;overflow:visible;line-height:1.35;font-size:9px;margin:3px 0;overflow-wrap:anywhere}
#panel.compact.mini .turnover-source{display:block;font-size:8px;line-height:11px;margin:2px 0}
#panel.compact.mini .stats{height:auto;min-height:34px;padding:5px;flex:none}
#panel.compact.mini .stats small{white-space:normal;line-height:1.25;font-size:8px}
#panel.compact.mini .stats strong{font-size:10px}
#panel.compact.mini .compact-actions{height:31px;margin:5px 0 0;position:static;flex:none}
#panel.compact.mini .compact-actions button{height:31px;min-width:0;font-size:9px}
#panel.compact.mini .steps,#panel.compact.mini .step-labels,#panel.compact.mini .metrics,
#panel.compact.mini #cards-result,#panel.compact.mini #chart-wrap,#panel.compact.mini #table-strip{display:none}
/* Keep both existing status locations single-line; no panel size changes. */
#panel .roomline{flex-wrap:nowrap;min-width:0;overflow:hidden}
#panel #focus-table{flex:none;white-space:nowrap}
#panel #focus-phase{flex:1;min-width:0;white-space:nowrap;overflow-x:auto;overflow-y:hidden;text-overflow:clip;scrollbar-width:none;touch-action:pan-x}
#panel #hero-status,#panel.compact.mini #hero-status{display:block;white-space:nowrap;overflow-x:auto;overflow-y:hidden;text-overflow:clip;-webkit-line-clamp:unset;overflow-wrap:normal;scrollbar-width:none;touch-action:pan-x}
#panel #focus-phase::-webkit-scrollbar,#panel #hero-status::-webkit-scrollbar{display:none}
#panel select:not([hidden]),#panel #settings-page select:not([hidden]){padding-top:0;padding-bottom:0;padding-left:8px;padding-right:28px;line-height:normal;min-width:0}
#panel #settings-page input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=hidden]),#panel #settings-page textarea{padding-top:0;padding-bottom:0;line-height:normal}
/* iOS focuses sub-16px controls by zooming the whole viewport. This must live
   inside the shared shadow-root CSS as document styles cannot reach it. */
@media(pointer:coarse){
  input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=hidden]),textarea,select{font-size:16px!important}
}
`;

  // lib/dg-panel-density.ts
  var DG_DENSITY_CSS = "/* \u56FA\u5B9A\u5916\u6846\u8CC7\u8A0A\u5BC6\u5EA6\u7248\uFF1B\u4E0D\u5F71\u97FF\u9001\u55AE\u6216\u5E33\u672C\u3002 */\n#panel.compact{padding:9px 10px;gap:0}\n.compact #head{height:25px}\n.compact #overview-page{display:flex;flex-direction:column;overflow:hidden;gap:3px}\n.compact .parallel-control{height:27px;flex:none;margin:0;gap:8px}\n.compact .parallel-control label{font-size:10px}\n.compact .parallel-control select{height:27px;font-size:11px}\n.compact .parallel-summary{height:13px;flex:none;margin:0;font-size:9px;color:#b1aab9;white-space:nowrap}\n.compact .mini-context{display:flex;align-items:center;justify-content:space-between;height:16px;flex:none;font-size:9px;color:#bbb2c5;gap:5px}\n.compact .mini-context strong{color:#e5e2e8;font-size:10px;font-variant-numeric:tabular-nums}\n.compact #mini-running{white-space:nowrap}\n.compact .hero{padding:0;flex:none;height:144px;display:flex;flex-direction:column;min-width:0;gap:0}\n.compact #target-box{height:87px;flex:none;min-width:0}\n.compact .roomline{margin:0;height:17px;gap:6px;font-size:11px}\n.compact .roomline .subtle{font-size:9px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n.compact .bet-main{height:40px;margin:1px 0;gap:8px}\n.compact .ring{height:36px;width:36px}\n.compact .ring-inner{font-size:12px}\n.compact .bet-value{min-width:0;gap:5px}\n.compact .amount{font-size:28px;letter-spacing:-.8px;min-width:0;font-variant-numeric:tabular-nums;white-space:nowrap}\n.compact .amount.long-number{font-size:22px}\n.compact .side{font-size:9px;padding:3px 4px}\n.compact .meta{height:13px;font-size:9px;line-height:13px;color:#ada4b5;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n.compact .steps{margin:3px 0 0;height:2px}\n.compact .step{height:2px}\n.compact .step-labels{margin:2px 0 0;font-size:8px}\n.compact .metrics{margin:2px 0 0;height:24px;flex:none}\n.compact .metrics small{font-size:8px;margin:0 0 2px;color:#a99ead}\n.compact .metrics strong{font-size:11px}\n.compact .range-view{height:8px;flex:none;margin:1px 0 2px}\n.compact .statusline{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:3px 0 0;font-size:9px;line-height:12px;color:#b8a9ba;min-height:0;height:24px;flex:none;cursor:pointer;overflow-wrap:anywhere}\n.compact .cards-result{height:19px;padding:0;margin:1px 0;flex:none;border-radius:4px;align-items:center;gap:8px}\n.compact:has(#cards-result:not([hidden])) #target-box{height:68px}\n.compact:has(#cards-result:not([hidden])) .steps,.compact:has(#cards-result:not([hidden])) .step-labels{display:none}\n.compact .cards-side{display:flex;align-items:center;gap:4px}\n.compact .cards-side>small{font-size:8px;white-space:nowrap}\n.compact .cards-side>strong{font-size:9px;float:none}\n.compact .cards-line{margin:0;gap:2px}\n.compact .playing-card{width:12px;height:16px;border-radius:2px;font-size:9px}\n.compact .stats{height:40px;flex:none;margin:0;padding:6px 8px;gap:4px}\n.compact .stats small{font-size:8px;margin-bottom:3px;white-space:nowrap}\n.compact .stats strong{font-size:11px;white-space:nowrap}\n.compact .chart-wrap{height:64px;flex:none;padding:5px 7px 3px;margin:0}\n.compact .chart-head{font-size:8px;height:11px}\n.compact .chart-head strong{font-size:9px}\n.compact .chart{height:32px;margin:3px 0 0}\n.compact .chart-empty{font-size:9px;top:30px}\n.compact .chart-foot{font-size:8px;height:10px;margin-top:2px}\n.mini-context,#table-strip{display:none}\n.compact #table-strip{display:flex;height:32px;flex:none;gap:4px;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;scrollbar-color:#55495d transparent}\n.table-chip{flex:none;min-width:72px;max-width:105px;padding:3px 5px;text-align:left;border:1px solid #453d4c;border-radius:5px;background:#252129;font-size:9px;line-height:12px;overflow:hidden}\n.table-chip.selected{border-color:#8aab8c;background:#2e3a31}\n.table-chip strong,.table-chip small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.table-chip strong{font-size:9px;font-weight:600}\n.table-chip small{font-size:8px;color:#b8abba}\n.compact .compact-actions{height:31px;flex:none;margin:0;padding:0;position:static;gap:6px}\n.compact .compact-actions button{height:31px;font-size:10px;border:1px solid #ffffff08}\n.compact .search-box{min-height:0;height:87px;padding:2px 0}\n.compact .search-box strong{font-size:17px}\n.compact .search-note{font-size:9px}\n#hero-status:focus-visible{outline:1px solid #93ac93}\n.form-body label{font-size:10px;margin:8px 0 4px}\n.form-body select,.form-body input:not([type=checkbox]){height:29px;font-size:11px}\n#settings-page .page-title,#logs-page .page-title{font-size:16px;margin:8px 0 6px}\n#settings-page .page-caption,#logs-page .page-caption{font-size:10px;margin-bottom:8px}\n#settings-page .settings-added{font-size:9px}\n\n.report-scroll{overflow-x:hidden}.report-card{border:1px solid #4a3b24;background:#211b13;border-radius:6px;padding:8px;margin-bottom:7px}.report-card-head{display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:11px;margin-bottom:5px}.report-card-head strong{font-size:11px}.report-state{color:#baaa8b;font-size:9px}.report-values{display:flex;justify-content:space-between;gap:5px;font-size:10px;font-variant-numeric:tabular-nums}.report-card-time{font-size:8px;color:#a08f72;margin-top:5px;overflow-wrap:anywhere}.report-footer{display:flex;flex-wrap:wrap;gap:7px}.report-footer>span:first-child{width:100%;font-size:10px;line-height:1.5}.report-scroll .report-empty{padding:16px 8px}.report-note{font-size:9px}\n\n.compact .tools{gap:1px}.compact .tools button{width:21px;height:23px;font-size:13px}.compact .brand{font-size:11px}.compact .parallel-summary{color:#c8bfce}.compact .mini-context{font-size:10px;color:#c9c2d1}.compact .subtle,.compact .meta{font-size:10px;color:#c3bacb}.compact .step-labels{font-size:9px;color:#ada4b5}.compact .metrics small,.compact .stats small{font-size:9px;color:#c0b4c8}.compact .chart-head,.compact .chart-foot{font-size:9px;color:#c3b8cc}.compact .chart-empty{color:#b9adc3}.compact .table-chip small{font-size:9px;color:#cec3d5}.compact .table-chip strong{font-size:10px}.compact .chart-wrap{height:65px}.form-body #zoom{height:20px;padding:0;accent-color:#8ead95}.page-caption,.settings-added,.fineprint{color:#c1b5ca!important;font-size:10px!important}.form-body label{color:#e0d6e7}.ack{font-size:10px!important}.report-note,.report-card-time,.report-state{font-size:10px;color:#c9b794}.report-values{font-size:11px}.report-card-head strong{font-size:12px}\n\n*{scrollbar-width:none!important}*::-webkit-scrollbar{display:none!important;width:0;height:0}#overview-page,#settings-page,#logs-page,.report-scroll,#events,#table-strip{scrollbar-width:none!important;-ms-overflow-style:none}#table-strip{overscroll-behavior-x:contain}\n\n.choose-tables{height:27px;font-size:10px;padding:0 6px;border:1px solid #544c5c;border-radius:6px;background:#28222e;flex:none}.rooms-back{width:100%;height:32px;margin-top:14px;border-radius:7px;background:#34473a;font-size:11px}#rooms-page{flex:1;min-height:0;overflow:auto}#rooms-page .room{font-size:11px;min-height:31px;padding:7px 10px}#rooms-page .page-title{font-size:16px;margin:10px 0}\n\n:host{--gold:#d5b779;--mint:#9bd0af;--muted:#b4bec2;color:#f1f5f3;-webkit-font-smoothing:antialiased}\n#panel,#panel.compact{background:radial-gradient(ellipse at 100% 0,#33423b40,transparent 50%),linear-gradient(165deg,#171e1e,#111718 75%);border:1px solid #84968a38;box-shadow:0 14px 38px #0008,inset 0 1px 0 #ffffff0c}\n.compact .brand{color:#ecdfbe;font-weight:700;letter-spacing:.1px}.dot{background:#a5d4b1;box-shadow:0 0 8px #a5d4b155}\n.tools button{background:#25302f;border:1px solid #90a29320;color:#b8c7c2;display:grid;place-items:center}.tools button svg{width:13px;height:13px;stroke:currentColor;stroke-width:1.7;fill:none;stroke-linecap:round;stroke-linejoin:round}.tools button:hover{background:#34443e;color:#f2e3bb}.tools button.active{color:#e8c890;border-color:#d5b77988;background:#50432e}\nbutton{transition:background .12s,border-color .12s,color .12s}button:disabled{cursor:default;opacity:.6}select,input:not([type=checkbox]){outline:none}.parallel-control select,.form-body select,.form-body input:not([type=checkbox]){background:#232d2d;border-color:#82938b44;color:#f0f5f1;border-radius:7px}.parallel-control select:focus,.form-body select:focus,.form-body input:focus{border-color:#d5b779;box-shadow:0 0 0 2px #d5b77917}\n.choose-tables{background:#38372a;border-color:#b49a6355;color:#ead7ac}.compact .parallel-summary{color:#acbab4}.compact .mini-context{color:#a7b7af}.compact #mini-running{color:#d2c49e}.compact .roomline{color:#edf5ef}.compact .meta,.compact .subtle{color:#becbc4}.compact .amount{color:#f5f8f3;text-shadow:0 2px 12px #b8d1b211}.side{background:#623d354d;color:#f4a38c}.side.player{background:#324b6455;color:#aad4ff}.ring-inner{background:#1b2623;color:#d8e9db}\n.compact .stats{background:linear-gradient(115deg,#28352f,#222c2b);border:1px solid #93aa9726;border-radius:8px}.compact .stats small,.compact .metrics small{color:#bec9c1}.green{color:#a1d8b2!important}.red{color:#eeac9c!important}\n.compact .chart-wrap{background:#14201d;border-color:#92a99924;border-radius:8px}.compact .chart-head{color:#c1ccbf}.compact .chart-head strong{color:#d7bf8e}.compact .chart-foot{color:#b1bdb1}.chart polyline{stroke:#9ac9a7}.chart .chart-dot{fill:#cde2af}.chart .chart-area{fill:#9ac9a722}\n.table-chip{background:#24302e;border-color:#84988a33;border-radius:7px}.table-chip.selected{background:linear-gradient(120deg,#3b4738,#2a3930);border-color:#c2b58288}.compact .table-chip strong{color:#f0ebda}.compact .table-chip small{color:#b8c9bc}\n.compact .compact-actions button{background:#293634;border-color:#90a79835;color:#e3ede5;font-weight:600;border-radius:8px}.compact .compact-actions #compact-stop{background:linear-gradient(120deg,#3c644d,#2d523d);color:#ddf1df;border-color:#8ec09755}.compact .compact-actions #compact-stop.live{background:linear-gradient(120deg,#733f36,#58342e);color:#ffe1d4;border-color:#d68d7655}\n.form-body label{color:#d9e1d8}.settings-added{color:#b8c9bd!important}.ack{color:#c9d4cb!important}.ack input{accent-color:#bba675}.setting-actions #start,.rooms-back{background:#3b614d;color:#e9f4e8}.setting-actions #once{background:#4a4935;color:#e7dcbd}.setting-actions #stop{background:#673b32;color:#f7d5c9}.room{background:#25322d;border-color:#87998c44;color:#d4dfd5}.room.active{background:#494734;border-color:#c5ae73;color:#f4e1b7}\n.page-title{color:#f1e5c7}.log-status{background:#26342e;border:1px solid #8ba78e30;color:#e2e7d5!important}#events{font-size:10px;color:#c5d2c8}.report-shell{background:linear-gradient(155deg,#19201b,#131a17);border-color:#a893654d}.report-card{background:linear-gradient(120deg,#29332a,#222d25);border-color:#b19c6636;border-radius:8px}.report-card-head strong{color:#f3e4c1}.report-state,.report-note,.report-card-time{color:#bfccb7}.report-filter select,.report-filter button{background:#263428;border-color:#97a58355}.report-head button,.report-footer button{background:#3a4434;border-color:#98a68355}.report-head h2{color:#e7d3a2}.report-tabs button.selected{color:#e7c784;border-color:#d0b571}\n\n.compact #head{height:50px;flex:none}.compact .topline{height:48px;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:5px}.compact .brand{font-size:13px;line-height:15px}.compact .tools{width:100%;gap:3px;justify-content:space-between}.compact .tools button{height:28px;width:25px;min-width:25px;border-radius:6px;background:#304039;border-color:#a4bbab66;color:#e2eade;box-shadow:inset 0 1px 0 #ffffff12}.compact .tools #nav-overview,.compact .tools #nav-settings,.compact .tools #nav-logs{width:43px;display:flex;gap:3px;justify-content:center;font-size:10px}.compact .tools button svg{width:15px;height:15px}.compact .tools #nav-overview svg,.compact .tools #nav-settings svg,.compact .tools #nav-logs svg{width:12px;height:12px}.compact .tools button.active{background:#6a5931;border-color:#dbc584;color:#fff0bf;box-shadow:0 0 7px #dcc48220}.compact .tools #hide{color:#e9b6a5;background:#533a33;border-color:#c7947766}.compact .hero{height:119px}.compact .metrics{display:none}.compact .statusline{margin-top:5px}.compact .hero #target-box{height:87px}.compact:has(#cards-result:not([hidden])) .hero #target-box{height:68px}.compact .bet-main{margin-top:2px}.compact #overview-page{gap:3px}\n\n#head{height:50px;flex:none}.topline{height:48px;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:5px}.brand{font-size:13px;line-height:15px}.tools{width:100%;gap:3px;justify-content:space-between}.tools button,.compact .tools button{flex:none;padding:0}.tools #nav-overview,.tools #nav-settings,.tools #nav-logs{width:43px;display:flex;gap:3px;justify-content:center;font-size:10px}.tools #nav-overview svg,.tools #nav-settings svg,.tools #nav-logs svg{display:none}.tools span{white-space:nowrap;line-height:1;flex:none}.tools button{height:28px;width:25px;border-radius:6px}.tools button.active{background:#6a5931;border-color:#dbc584;color:#fff0bf}.brand{color:#ecdfbe;font-weight:700}\n\n.risk-overlay{position:absolute;right:0;top:0;width:276px;height:448px;z-index:10;display:grid;place-items:center;background:#08110ed9;backdrop-filter:blur(4px);border-radius:15px;transform:scale(var(--fit));transform-origin:top right;padding:12px}.risk-card{width:100%;padding:16px 12px 14px;border:1px solid #b7a06888;border-radius:12px;background:linear-gradient(155deg,#2c3123,#19221b);box-shadow:0 10px 25px #0007;text-align:center}.risk-triangle{width:74px;height:67px;margin:0 auto 8px;display:block;filter:drop-shadow(0 0 9px #d7b96b33)}.risk-triangle>path:first-child{fill:#e4c274;stroke:#f4dfa4;stroke-width:2;stroke-linejoin:round}.risk-mark{fill:none;stroke:#3a2a15;stroke-width:6;stroke-linecap:round}.risk-point{fill:#3a2a15}.risk-card h2{font-size:18px;color:#f2dfae;margin:0 0 13px}.risk-copy{font-size:13px;line-height:1.9;text-align:left;color:#eee8d7;margin:0 0 17px;overflow-wrap:anywhere}.risk-ack{display:flex;align-items:center;gap:7px;text-align:left;font-size:11px;line-height:1.6;color:#d3e3d5;margin:0 0 16px}.risk-ack input{margin:0;width:17px;height:17px;accent-color:#c6ad6a;flex:none}.risk-actions{display:flex;gap:8px}.risk-actions button{flex:1;height:35px;border:1px solid #84988555;border-radius:7px;background:#303d34;font-size:12px;font-weight:600;color:#e8eee8}.risk-actions #risk-confirm{background:#546d40;border-color:#b1c38588;color:#f4f3dd}.risk-actions #risk-confirm:disabled{background:#303b2b;opacity:.45;cursor:not-allowed}\n\n#panel.compact.mini{width:210px;height:228px;padding:9px;border-radius:12px}\n.compact.mini #head{height:29px}.compact.mini .topline{height:27px;flex-direction:row;align-items:center;gap:4px}.compact.mini .brand{font-size:12px;white-space:nowrap}.compact.mini .tools{width:auto;gap:0}.compact.mini .tools button{display:none}.compact.mini .tools #zoom-out{display:grid;width:31px;height:27px;color:#f7e7bc;border-color:#c5ae7366}.compact.mini .tools #zoom-out svg{width:17px;height:17px}\n.compact.mini .parallel-control,.compact.mini .parallel-summary,.compact.mini .chart-wrap,.compact.mini #table-strip{display:none}\n.compact.mini #overview-page{gap:5px}.compact.mini .mini-context{height:18px;font-size:10px}.compact.mini .hero{height:86px;padding:0}.compact.mini #target-box,.compact.mini:has(#cards-result:not([hidden])) .hero #target-box{height:60px}.compact.mini .roomline{height:16px;font-size:11px}.compact.mini .bet-main{height:39px;margin:2px 0 0;gap:6px}.compact.mini .amount{font-size:25px}.compact.mini .amount.long-number{font-size:19px}.compact.mini .ring{width:32px;height:32px}.compact.mini .bet-value{gap:4px}.compact.mini .side{font-size:9px;padding:3px}.compact.mini .meta,.compact.mini .steps,.compact.mini .step-labels,.compact.mini .cards-result{display:none}.compact.mini .statusline{font-size:10px;line-height:12px;height:24px;margin-top:2px}.compact.mini .stats{height:34px;padding:4px 6px;border-radius:6px}.compact.mini .stats small{font-size:9px;margin-bottom:2px}.compact.mini .stats strong{font-size:11px}.compact.mini .compact-actions{height:30px;gap:5px}.compact.mini .compact-actions button{height:30px;font-size:10px}.compact.mini .compact-actions #open-report{flex:.75}\n\n.compact.mini #overview-page{gap:4px}.compact.mini .hero{height:80px}.compact.mini .statusline{height:20px;line-height:10px}.compact.mini .stats{height:32px}.compact.mini .stats small{font-size:8px}\n\n.compact.mini .tools #nav-overview,.compact.mini .tools #nav-settings,.compact.mini .tools #nav-logs,.compact.mini .tools #nav-mode,.compact.mini .tools #zoom-in,.compact.mini .tools #hide{display:none}.compact.mini .bet-value{min-width:0}.compact.mini .stats>div{min-width:0}\n\n.compact.mini .topline{width:100%;justify-content:space-between}.compact.mini .tools{flex:none;width:31px}\n";

  // lib/dg-panel-pro.ts
  var DG_PRO_CSS = `
:host {
  --pro-bg: #11171c;
  --pro-surface: #1b242b;
  --pro-line: #34434c;
  --pro-text: #ecf3f5;
  --pro-muted: #a5b6bf;
  --pro-accent: #8ed8bf;
  -webkit-font-smoothing: antialiased;
}
#panel, #panel.compact, #panel.compact.mini {
  background: linear-gradient(150deg, #1a242b 0%, #121a20 65%, #10171c);
  border-color: #6e89994d;
  box-shadow: 0 14px 36px #0009, inset 0 1px 0 #ffffff0b;
}
.brand, .compact .brand {
  color: #f2eee1;
  letter-spacing: .2px;
  font-weight: 750;
}
.dot { background: #8ed8bf; box-shadow: 0 0 0 3px #8ed8bf12; }
.tools button, .compact .tools button {
  background: #233039;
  border-color: #4c636f99;
  color: #dbe8ee;
  box-shadow: inset 0 1px 0 #ffffff0b;
}
.tools button.active, .compact .tools button.active {
  background: #304940;
  border-color: #8ed8bfbb;
  color: #c9f3e7;
  box-shadow: inset 0 -2px 0 #8ed8bf66;
}
.compact .tools #hide, .compact.mini .tools #zoom-out {
  background: #26343e;
  border-color: #7695a5aa;
  color: #e1edf3;
}
.parallel-control label, .compact .parallel-control label { color: #d6e2e7; }
.parallel-control select, .form-body select, .form-body input:not([type=checkbox]) {
  background: #1c2932;
  border-color: #4d64706b;
  color: #f2f6f8;
  border-radius: 6px;
  box-shadow: inset 0 1px 3px #0002;
}
.parallel-control select:focus, .form-body select:focus, .form-body input:focus {
  border-color: #8ed8bf;
  box-shadow: 0 0 0 2px #8ed8bf22;
}
.choose-tables { background: #283a43; border-color: #5b7b8b99; color: #d4e9f3; }
.compact .parallel-summary { color: #a5b8c3; }
.compact .mini-context, .compact .meta, .compact .subtle { color: #b5c5ce; }
.compact #mini-running { color: #b9dacd; }
.compact .amount { color: #f4f8f9; text-shadow: none; }
.side { color: #f8b6a8; background: #7d484047; border: 1px solid #b47c6c33; }
.side.player { color: #b0d9ff; background: #3b5f8b44; border-color: #729ac633; }
.ring-inner { background: #18242b; color: #e1eee8; }
.compact .roomline { color: #f0f6f8; }
.compact .statusline { color: #b5c6d0; }
.compact .stats {
  background: linear-gradient(120deg, #24323a, #1d2a31);
  border-color: #607c8b40;
  border-radius: 7px;
}
.compact .stats small { color: #b8cad4; }
.compact .stats > div + div { padding-left: 5px; border-left: 1px solid #7a929d26; }
.compact .chart-wrap { background: #151f26; border-color: #60778335; }
.compact .chart-head, .compact .chart-foot { color: #b7c8d2; }
.compact .chart-head strong { color: #b7e5d2; }
.green { color: #a0e6c9 !important; }
.red { color: #f5b0a6 !important; }
.table-chip { background: #1e2b34; border-color: #607a873f; border-radius: 6px; }
.table-chip.selected { background: #2b4139; border-color: #8cc7b399; }
.compact .table-chip strong { color: #e7f2ee; }
.compact .table-chip small { color: #b9ccd6; }
.compact .compact-actions button {
  background: #293b46;
  border-color: #7594a477;
  color: #e3eff5;
  font-weight: 650;
  border-radius: 7px;
}
.compact .compact-actions #compact-stop {
  background: linear-gradient(120deg, #367d65, #29644f);
  border-color: #85d1b69c;
  color: #f0fff7;
}
.compact .compact-actions #compact-stop.live {
  background: linear-gradient(120deg, #894b44, #6e3e38);
  border-color: #d59b8ea0;
  color: #fff1ea;
}
.page-title, .report-head h2 { color: #edf4f6; letter-spacing: .2px; }
.form-body label { color: #dce7ed; }
.settings-added, .page-caption { color: #b6c7cf !important; }
.room { background: #24343d; color: #d1e2ea; border-color: #64829180; }
.room.active { background: #304b40; color: #d3f3e2; border-color: #8bc9aa; }
.rooms-back { background: #315d4e; color: #e1f5e8; border: 1px solid #7aad8d; }
.log-status { background: #1d3139; border-color: #6e9dac50; color: #cee4ec !important; }
#events { color: #c2d3dc; }
.report-shell { background: #131e25; border-color: #718d9b80; }
.report-head { border-color: #536e7c55; }
.report-card { background: #22343d; border-color: #64849455; }
.report-card-head strong { color: #e8f3f4; }
.report-state, .report-note, .report-card-time { color: #bfd1da; }
.report-head button, .report-footer button { background: #2d4350; border-color: #86a5b488; color: #e1eff6; }
.report-filter select, .report-filter button { background: #21343e; border-color: #68879677; color: #d9eaf2; }
.report-filter button.selected, .report-tabs button.selected { color: #b4ebd3; border-color: #8ed8bf; }
.report-tabs { border-color: #6a849344; }
.risk-overlay { background: #0a141de6; }
.risk-card { background: linear-gradient(155deg, #263039, #16212a); border-color: #bfa76fbb; }
.risk-copy { color: #e4edf2; }
.risk-ack { color: #d6e6ef; }
.risk-actions button { background: #2c3f4b; border-color: #809dad88; color: #e8f1f6; }
.risk-actions #risk-confirm { background: #3b775f; border-color: #93d3b7; color: #f1fff6; }
.risk-actions #risk-confirm:disabled { background: #2b383d; opacity: .45; }
/* \u6240\u6709\u6309\u9215\uFF1A\u89F8\u63A7\u6309\u58D3\u3001\u6ED1\u9F20\u61F8\u505C\u3001\u9375\u76E4\u7126\u9EDE\u53CA\u9EDE\u64CA\u5F8C\u9AD8\u4EAE\u3002 */
button, [role=button] {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: transform 100ms ease, filter 120ms ease, box-shadow 120ms ease,
    background-color 120ms ease, border-color 120ms ease;
}
button:not(:disabled):active, button[data-pressed=true]:not(:disabled),
[role=button]:active, [role=button][data-pressed=true] {
  transform: translateY(1px) scale(.97);
  filter: brightness(1.24);
  box-shadow: inset 0 0 0 2px #c2efdf88, inset 0 2px 5px #0004 !important;
}
@media (hover:hover) {
  button:not(:disabled):hover, [role=button]:hover {
    filter: brightness(1.16);
    box-shadow: 0 0 0 1px #a3cbbf66;
  }
}
button:focus-visible, [role=button]:focus-visible {
  outline: 2px solid #a8e4ce;
  outline-offset: 2px;
}
button:disabled { filter: saturate(.45); cursor: not-allowed; }
@media (prefers-reduced-motion:reduce) {
  button, [role=button] { transition: none; }
  button:active, button[data-pressed=true], [role=button]:active { transform: none; }
}
`;

  // lib/dg-panel-spacious.ts
  var DG_SPACIOUS_CSS = `
#panel:not(.mini), #panel.compact:not(.mini) {
  width: 336px;
  height: var(--full-height, 710px);
  padding: 18px;
  gap: 14px;
  border-radius: 18px;
  background: #141c22;
  border-color: #53697555;
  box-shadow: 0 22px 56px #0008, inset 0 1px 0 #ffffff08;
}
#panel:not(.mini) #head { height: 82px; }
#panel:not(.mini) .topline {
  width: 100%; height: 82px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: 32px 38px;
  gap: 10px 6px;
  align-items: center;
}
#panel:not(.mini) .brand { grid-column: 1 / 5; grid-row: 1; font-size: 16px; line-height: 1.4; }
#panel:not(.mini) .dot { width: 6px; height: 6px; margin-right: 3px; }
#panel:not(.mini) .tools { display: contents; }
#panel:not(.mini) .tools #nav-mode, #panel:not(.mini) .tools #hide { display: none; }
#panel:not(.mini) .tools #zoom-in { grid-column: 5; grid-row: 1; }
#panel:not(.mini) .tools #zoom-out { grid-column: 6; grid-row: 1; }
#panel:not(.mini) .tools #nav-overview { grid-column: 1 / 3; grid-row: 2; }
#panel:not(.mini) .tools #nav-settings { grid-column: 3 / 5; grid-row: 2; }
#panel:not(.mini) .tools #nav-logs { grid-column: 5 / 7; grid-row: 2; }
#panel:not(.mini) .tools button { width: 100%; height: 32px; border-radius: 7px; border-color: #52687355; background: #202d35; }
#panel:not(.mini) .tools #nav-overview, #panel:not(.mini) .tools #nav-settings, #panel:not(.mini) .tools #nav-logs {
  height: 38px; font-size: 12px; font-weight: 500; display: flex;
  border: 0; border-bottom: 2px solid transparent; border-radius: 0;
  background: none; color: #b6c4cb; box-shadow: none;
}
#panel:not(.mini) .tools button.active { color: #b0e6d0 !important; border-bottom-color: #8bd1b2 !important; box-shadow: none; }
#panel:not(.mini) #overview-page {
  display: flex; flex-direction: column; gap: 12px;
  overflow-y: auto; overflow-x: hidden; padding-right: 1px;
  flex: 1; min-height: 0;
}
#panel:not(.mini) .parallel-control { height: 38px; gap: 10px; margin: 0; }
#panel:not(.mini) .parallel-control label { font-size: 11px; }
#panel:not(.mini) .parallel-control select { height: 38px; font-size: 12px; border-radius: 8px; }
#panel:not(.mini) .choose-tables { height: 38px; font-size: 11px; padding: 0 10px; }
#panel:not(.mini) .parallel-summary { display: none; }
#panel:not(.mini) .mini-context { height: 20px; font-size: 11px; color: #a6bac5; flex: none; }
#panel:not(.mini) .mini-context strong { font-size: 13px; color: #e3edf2; }
#panel:not(.mini) .hero {
  height: auto; min-height: 120px; flex: none; padding: 0;
  background: none; display: flex; gap: 10px;
}
#panel:not(.mini) .hero #target-box { height: auto; min-height: 90px; }
#panel:not(.mini) .roomline { height: 22px; font-size: 13px; gap: 9px; margin: 0; }
#panel:not(.mini) .roomline .subtle { font-size: 10px; }
#panel:not(.mini) .bet-main { height: 50px; margin: 7px 0; flex-direction: row; justify-content: space-between; gap: 10px; }
#panel:not(.mini) .bet-value { flex: 1; gap: 10px; }
#panel:not(.mini) .amount { font-size: 38px; line-height: 1; letter-spacing: -1px; }
#panel:not(.mini) .amount.long-number { font-size: 29px; }
#panel:not(.mini) .side { font-size: 10px; padding: 5px 7px; border-radius: 6px; }
#panel:not(.mini) .ring { height: 43px; width: 43px; }
#panel:not(.mini) .ring-inner { font-size: 14px; }
#panel:not(.mini) .meta { height: auto; min-height: 17px; font-size: 10px; line-height: 1.6; white-space: normal; }
#panel:not(.mini) .steps, #panel:not(.mini) .step-labels, #panel:not(.mini) .metrics { display: none; }
#panel:not(.mini) .statusline {
  height: auto; min-height: 17px; max-height: 34px;
  font-size: 11px; line-height: 17px; margin: 0;
  color: #adbec7; -webkit-line-clamp: 2;
}
#panel:not(.mini) .stats {
  height: 64px; padding: 12px 10px; flex: none;
  border-radius: 9px; background: #1c2a32; border-color: #607b8838;
}
#panel:not(.mini) .stats small { font-size: 10px; margin-bottom: 8px; font-weight: 400; color: #a4b7c3; }
#panel:not(.mini) .stats strong { font-size: 16px; font-weight: 600; }
#panel:not(.mini) .stats > div + div { padding-left: 12px; border-color: #637c8733; }
#panel:not(.mini) .chart-wrap { height: 94px; padding: 11px 10px 8px; margin: 0; flex: none; background: #18232b; border-radius: 9px; }
#panel:not(.mini) .chart-head { height: 13px; font-size: 10px; }
#panel:not(.mini) .chart-head strong { font-size: 11px; }
#panel:not(.mini) .chart { height: 43px; margin: 7px 0 4px; }
#panel:not(.mini) .chart-foot { height: 12px; font-size: 9px; margin: 0; color: #9cb3c0; }
#panel:not(.mini) .chart-empty { top: 42px; font-size: 10px; }
#panel:not(.mini) #table-strip { display: flex; height: 48px; min-height: 48px; gap: 7px; overflow-x: auto; flex: none; }
#panel:not(.mini) .table-chip { min-width: 112px; max-width: 138px; padding: 7px 9px; border-radius: 8px; background: #1c2a33; }
#panel:not(.mini) .table-chip strong { font-size: 11px; line-height: 15px; font-weight: 600; }
#panel:not(.mini) .table-chip small { font-size: 10px; line-height: 15px; font-weight: 400; }
#panel:not(.mini) > .compact-actions { height: 44px; min-height: 44px; margin: 0; padding: 0; display: flex; gap: 9px; flex: none; border-top: 1px solid #59717b33; }
#panel:not(.mini) > .compact-actions button { height: 44px; font-size: 12px; font-weight: 600; border-radius: 8px; }
#panel:not(.mini) > .compact-actions #open-report { flex: .75; background: #263841; border-color: #78909c55; }
#panel:not(.mini):has(#overview-page[hidden]) > .compact-actions { display: none; }
#panel.mini { gap: 4px; }
#panel.mini > .compact-actions { height: 30px; min-height: 30px; flex: none; margin: 0; padding: 0; }
#panel.mini #overview-page { overflow-y: auto; }
#panel:not(.mini) .page-title { font-size: 20px; margin: 4px 0 18px; font-weight: 650; }
#panel:not(.mini) .form-body label { font-size: 12px; margin: 18px 0 9px; }
#panel:not(.mini) .form-body select, #panel:not(.mini) .form-body input:not([type=checkbox]) { height: 42px; font-size: 13px; padding: 9px 11px; border-radius: 8px; }
#panel:not(.mini) .form-row { gap: 12px; }
#panel:not(.mini) .settings-added { font-size: 11px; line-height: 1.7; margin: 12px 0; }
#panel:not(.mini) .page-caption { font-size: 11px; line-height: 1.7; margin: 0 0 16px; }
#panel:not(.mini) #events { font-size: 11px; line-height: 1.9; }
#panel:not(.mini) .log-status { padding: 13px; margin: 0 0 16px; line-height: 1.8; }
#panel:not(.mini) #rooms { gap: 8px; }
#panel:not(.mini) #rooms .room { min-height: 38px; font-size: 12px; padding: 8px 12px; }
#panel:not(.mini) .rooms-back { height: 40px; margin-top: 18px; font-size: 12px; }
.risk-overlay, .report-shell { width: 336px; height: var(--full-height, 710px); }
.risk-overlay { padding: 20px; border-radius: 18px; }
.risk-card { padding: 22px 18px 18px; border-radius: 13px; }
.risk-triangle { width: 70px; height: 65px; margin-bottom: 16px; }
.risk-copy { font-size: 13px; line-height: 1.9; margin-bottom: 22px; }
.risk-ack { font-size: 12px; margin-bottom: 20px; }
.risk-actions button { height: 42px; font-size: 13px; }
.report-shell { padding: 18px; border-radius: 18px; }
.report-head h2 { font-size: 18px; }
.report-head button { font-size: 11px; padding: 8px 10px; }
.report-filter { gap: 8px; margin: 16px 0; }
.report-filter label, .report-filter select, .report-filter button { font-size: 10px; }
.report-card { padding: 12px; margin-bottom: 10px; border-radius: 8px; }
.report-card-head strong { font-size: 13px; }
.report-values { font-size: 12px; margin: 9px 0; }
.report-card-time { font-size: 10px; }
.report-footer { gap: 9px; padding-top: 9px; }

/* \u67D4\u548C\u547C\u5438\u6307\u793A\uFF1A\u53EA\u8868\u793A\u5DE5\u5177\u5B58\u5728\uFF0C\u4E0D\u4EE3\u8868\u4E0B\u6CE8\u6210\u529F\u6216\u9023\u7DDA\u6B63\u5E38\u3002 */
.dot { position: relative; flex: none; animation: dg-dot-breathe 2600ms ease-in-out infinite; }
.dot::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 1px solid #8dd8b480; animation: dg-dot-halo 2600ms ease-in-out infinite; pointer-events: none; }
@keyframes dg-dot-breathe { 0%,100% { opacity: .65; box-shadow: 0 0 3px #83d6b133; } 50% { opacity: 1; box-shadow: 0 0 10px #83d6b188; } }
@keyframes dg-dot-halo { 0%,100% { transform: scale(.75); opacity: .15; } 50% { transform: scale(1.2); opacity: .65; } }
.risk-overlay { overflow-y: auto; align-items: safe center; }
.risk-card { flex: none; max-width: 100%; }
#panel:not(.mini) .headline, #panel:not(.mini) .hero-head, #panel:not(.mini) .main-action, #panel:not(.mini) .section-head, #panel:not(.mini) #tables, #panel:not(.mini) .footer { display: none; }
@media (prefers-reduced-motion:reduce) { .dot,.dot::after { animation: none; opacity: 1; } }
`;

  // lib/dg-panel-surfaces.ts
  var DG_SURFACES_CSS = `
:host { --ui-border: #47617140; --ui-card: #1b2932; --ui-label: #a9bdc9; --ui-accent: #a0dcc4; }
#panel, .report-shell { font-variant-numeric: tabular-nums; }
.surface-heading { display:flex;align-items:center;justify-content:space-between;gap:12px;margin:2px 0 9px; }
#panel:not(.mini) .surface-heading .page-title {margin:0;font-size:21px;line-height:1.4;}
.surface-kicker { font-size:9px;color:#84b19f;letter-spacing:1.1px;margin:0 0 5px; }
.surface-note {font-size:11px;color:var(--ui-label);line-height:1.8;margin:0 0 18px;}
.surface-icon {display:grid;place-items:center;width:36px;height:36px;border:1px solid #82ab9840;background:#243b34;border-radius:10px;color:#b7e6d2;flex:none;}
.surface-icon svg {width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;}
#panel:not(.mini) .form-section {border:1px solid var(--ui-border);border-radius:11px;background:#1a272f;padding:14px;margin-bottom:14px;}
.form-section-head {font-size:11px;font-weight:600;color:#d3e1e8;display:flex;align-items:center;gap:8px;margin:0 0 11px;}
.form-section-head i {font-style:normal;font-size:9px;color:#a4d6c0;border:1px solid #7baa9538;border-radius:5px;padding:3px 5px;background:#263c33;}
#panel:not(.mini) .form-section label {font-size:11px;margin:12px 0 7px;color:#b4c8d2;}
#panel:not(.mini) .form-section select,#panel:not(.mini) .form-section input:not([type=checkbox]) {height:39px;background:#111e26;border-color:#536e7e55;font-size:12px;border-radius:7px;}
#panel:not(.mini) .form-section .settings-added {font-size:10px;color:#94b0bf!important;margin:10px 0 0;line-height:1.7;}
.form-section .form-row {gap:10px;}
.form-section .field-note {font-size:10px;color:#91a9b7;line-height:1.7;margin:11px 0 0;}
#panel:not(.mini) #rooms-page {display:flex;flex-direction:column;overflow:hidden;}
#panel:not(.mini) #rooms {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;overflow-y:auto;min-height:0;align-content:start;flex:1;}
#panel:not(.mini) #rooms .room {min-height:77px;padding:12px;display:flex;flex-direction:column;gap:9px;align-items:stretch;text-align:left;background:#1b2932;border:1px solid #4e6c7b55;border-radius:10px;}
.room-title {display:flex;justify-content:space-between;align-items:center;gap:8px;}
.room-title strong {font-size:14px;color:#edf6f3;font-weight:650;}
.room-check {width:18px;height:18px;border:1px solid #78909b66;border-radius:50%;display:grid;place-items:center;font-size:10px;color:transparent;}
.room-detail {font-size:10px;font-weight:400;color:#adc1cc;line-height:1.5;}
#panel:not(.mini) #rooms .room.active {background:#243d33;border-color:#90caae88;box-shadow:inset 0 1px 0 #b6e8cc12;}
.room.active .room-check {color:#16271f;border-color:#a3dec4;background:#a3dec4;}
.room:disabled {opacity:.6;}
#panel:not(.mini) .rooms-back {flex:none;margin-top:15px;height:42px;background:#386c56;border-color:#78ac96;}
#panel:not(.mini) #logs-page {display:flex;flex-direction:column;overflow:hidden;}
#panel:not(.mini) .log-status {font-size:11px;background:#223830;border:1px solid #709c8847;border-radius:10px;padding:13px;margin:0 0 16px;color:#cce4d7!important;}
.log-label {display:block;font-size:9px;color:#8ebfa9;margin-bottom:7px;letter-spacing:.4px;}
#panel:not(.mini) #events {flex:1;min-height:0;max-height:none;overflow-y:auto;white-space:normal;padding:0 0 8px;}
.event-card {position:relative;padding:0 0 16px 16px;border-left:1px solid #7893883b;margin-left:4px;}
.event-card::before {content:'';position:absolute;width:6px;height:6px;border-radius:50%;background:#8daaa0;left:-3.5px;top:5px;}
.event-card time {font-size:9px;line-height:1.5;color:#8fa7b5;display:block;margin-bottom:5px;}
.event-card p {font-size:11px;line-height:1.8;color:#d3e1e8;margin:0;overflow-wrap:anywhere;}
.event-card.accepted::before {background:#9edbbd;}
.event-card.warning::before {background:#e1b680;}
#panel:not(.mini) .statusline {border-left:2px solid #719b87;padding-left:8px;}
#panel:not(.mini) .mini-context {color:#aec2cb;}
#panel:not(.mini) .side {border-radius:5px;}
#panel:not(.mini) #table-strip {gap:8px;}
#panel:not(.mini) .table-chip.selected {border-color:#a2d5bd90;background:#293f36;}
.report-shell {background:#141f27;color:#d6e6ee;}
.report-head {padding:0 0 16px;border-bottom:1px solid #5a738144;gap:10px;flex:none;}
.report-head h2 {font-size:21px;line-height:1.4;letter-spacing:.1px;}
.report-head button {border:1px solid #69879755;background:#243841;color:#cde2ec;border-radius:7px;min-height:34px;}
.report-filter {display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px 8px;padding:14px 0;margin:0;flex:none;}
.report-filter label {grid-column:span 3;display:flex;flex-direction:column;gap:7px;font-size:10px;color:#aabfcc;}
.report-filter select {width:100%;height:35px;background:#1b2c37;border-color:#5c7b8c55;border-radius:7px;padding:6px 9px;color:#dcebf2;font-size:11px;}
.report-filter>button {grid-column:span 2;height:34px;border:1px solid #4f6a7a66;border-radius:7px;font-size:11px;color:#b8ccd5;background:#1c2d36;}
.report-filter>button.selected {background:#2c493b;border-color:#92c7ad88;color:#c3e9d4;}
.report-tabs {margin:0;border-color:#5c778044;gap:12px;flex:none;}
.report-tabs button {font-size:11px;padding:8px 0 10px;}
.report-tabs button.selected {color:#b4e3cf;border-bottom-color:#98d6b8;}
.report-note {font-size:10px;color:#96b0c0;margin:10px 0 14px;flex:none;}
.report-card {background:#1c2d37;border:1px solid #526e7d50;border-radius:10px;padding:13px;margin-bottom:12px;}
.report-card-head {margin:0 0 10px;}
.report-card-head strong {font-size:13px;letter-spacing:.1px;}
.report-state {font-size:9px;background:#2e443b;color:#bbd9c8;border-radius:5px;padding:4px 6px;}
.report-values {font-size:11px;color:#b8d0dc;margin:0;padding:9px 0;border-top:1px solid #7c9da02b;}
.report-values strong {font-size:13px;}
.report-card-time {font-size:9px;margin-top:4px;color:#8eabba;line-height:1.6;}
.report-footer {flex-direction:column;align-items:stretch;gap:13px;margin:12px 0 0;padding:13px 0 0;border-top:1px solid #607c8838;color:#b7cdd7;flex:none;}
.report-footer #report-total {font-size:10px;line-height:1.8;width:100%;}
.report-footer>span:last-child {display:flex;align-items:center;justify-content:space-between;gap:10px;}
.report-footer button {height:33px;min-width:73px;font-size:10px;border-color:#6b879855;border-radius:7px;}
.report-empty {font-size:12px;line-height:1.8;padding:38px 16px!important;color:#a7bfcd;}
.risk-overlay {background:#0a141cde;backdrop-filter:blur(7px);}
.risk-card {background:#1c2b34;border:1px solid #a58d5977;border-radius:15px;padding:24px 20px 20px;text-align:left;box-shadow:0 15px 38px #0007;}
.risk-emblem {width:76px;height:76px;background:#ad8d4020;border:1px solid #c8a56038;display:grid;place-items:center;margin:0 auto 20px;border-radius:20px;}
.risk-triangle {width:48px;height:45px;margin:0;filter:none;}
.risk-card h2 {font-size:20px;color:#f0dcac;margin:0 0 16px;text-align:center;font-weight:650;}
.risk-copy {font-size:12px;line-height:2;color:#d5e0e6;margin:0 0 20px;}
.risk-ack {padding:12px 10px;border:1px solid #6281744d;background:#233b30;border-radius:8px;font-size:11px;line-height:1.7;gap:9px;margin:0 0 18px;color:#c6e3d3;}
.risk-ack input {width:18px;height:18px;accent-color:#9fcbb3;}
.risk-actions {gap:10px;}
.risk-actions button {height:42px;border-radius:8px;font-size:12px;font-weight:600;}
.risk-actions #risk-cancel {background:#263842;border-color:#74919e70;color:#d0e2ec;}
.risk-actions #risk-confirm {background:#40785e;border-color:#91cbb0;color:#ebfff3;}
#panel.compact.mini {background:#141f27;border-color:#607c8c70;border-radius:13px;box-shadow:0 14px 30px #0007;}
.compact.mini .brand {color:#e4eee9;font-weight:650;font-size:12px;}
.compact.mini .tools #zoom-out {background:#253c46;border-color:#7b9aaa66;border-radius:7px;color:#dcecf2;}
.compact.mini .mini-context {color:#98b5c5;font-size:10px;}
.compact.mini #mini-running {color:#afd6c3;}
.compact.mini .roomline {color:#ebf2f5;}
.compact.mini .ring-inner {background:#182831;}
.compact.mini .stats {background:#20323c;border-color:#607c8c40;border-radius:7px;}
.compact.mini .stats small {color:#a2becb;}
.compact.mini .stats strong {color:#d6e8ef;}
.compact.mini .compact-actions {background:none;}
.compact.mini .compact-actions #open-report {background:#283e49;border-color:#7c99a955;font-size:10px;}
.compact.mini .compact-actions #compact-stop {background:#3a785e;border-color:#8ec6ab88;font-size:10px;}
.compact.mini .compact-actions #compact-stop.live {background:#804b45;border-color:#c78d8377;}

#panel:not(.mini),#panel.compact:not(.mini),.report-shell,.risk-overlay {width:var(--full-width,336px);}
#panel:not(.mini) .topline {grid-template-columns:repeat(6,minmax(0,1fr));}
#panel:not(.mini) .brand {grid-column:1/5;}
#panel:not(.mini) .tools #zoom-in {display:none;}
#panel:not(.mini) .tools #zoom-out {grid-column:5/7;display:flex;gap:7px;align-items:center;justify-content:center;width:100%;height:34px;font-size:11px;color:#cce8dc;background:#2a4139;border:1px solid #80b79e66;}
#panel:not(.mini) .tools #zoom-out svg {width:14px;height:14px;}
#panel.compact.mini {width:210px;}
.compact.mini .tools {width:45px;}
.compact.mini .tools #zoom-out {display:flex;align-items:center;justify-content:center;width:45px;height:28px;font-size:9px;padding:0;}
.compact.mini .tools #zoom-out svg {display:none;}
.resize-grip {position:absolute;right:1px;bottom:1px;width:25px;height:25px;display:grid;place-items:center;color:#7898a7;cursor:nwse-resize;touch-action:none;z-index:2;border-radius:0 0 15px 0;background:none;}
.resize-grip svg {width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;}
.resize-grip:hover,.resize-grip[data-resizing=true] {color:#c0e5d0;background:#72a48b22;}
#panel.mini .resize-grip {display:none;}
#panel:not(.mini)> .compact-actions {margin-bottom:7px;}
.report-shell {padding-bottom:26px;}
#panel:not(.mini) #settings-page {overflow-y:auto;}
#panel:not(.mini) #settings-page .form-body {padding:0;}
#panel:not(.mini) #logs-page .surface-note,#panel:not(.mini) #rooms-page .surface-note {flex:none;}
#panel:not(.mini) .surface-heading {flex:none;}
#panel:not(.mini) .cards-result {height:auto;min-height:40px;padding:7px 9px;background:#20313b;border:1px solid #54718444;border-radius:8px;}
#panel:not(.mini) .cards-side small {font-size:9px;}
#panel:not(.mini) .playing-card {width:18px;height:26px;font-size:10px;}

.selection-control {display:flex;flex-direction:column;gap:10px;padding:12px;border:1px solid #5c7d7040;background:#23372e;border-radius:10px;margin:4px 0 14px;flex:none;}
.selection-control span {font-size:11px;color:#c0decf;line-height:1.7;}
.selection-control button {height:33px;border-radius:7px;background:#293e45;border:1px solid #7da79355;font-size:11px;}
.selection-control button.selected {background:#38674f;color:#daf6e6;}

.strategy-preview {display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#8faebb;margin:0 0 8px;}
.strategy-preview strong {color:#c4e5d5;font-size:10px;font-weight:500;border:1px solid #87b49a40;background:#243b302e;border-radius:5px;padding:3px 7px;}
.compact.mini .strategy-preview {display:none;}
#panel:not(.mini) .hero {min-height:145px;}
#panel:not(.mini) .statusline {margin-top:0;}

.provider-picker {position:relative;}
#provider-trigger {width:100%;display:flex;gap:10px;align-items:center;height:40px;border:1px solid #65889966;border-radius:8px;background:#13212b;padding:0 11px;color:#dfedf4;font-size:12px;}
.provider-logo {display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;flex:none;color:#e1f4ec;}
.provider-logo svg {height:20px;width:20px;fill:inherit;}
.provider-logo svg[fill="currentColor"] {fill:currentColor;}
.provider-arrow {width:13px;height:13px;margin-left:auto;fill:none;stroke:currentColor;stroke-width:1.8;}
#provider-trigger[aria-expanded=true] {border-color:#9bccb3;}
#provider-trigger[aria-expanded=true] .provider-arrow {transform:rotate(180deg);}
#provider-menu {position:absolute;left:0;right:0;top:46px;z-index:5;background:#1e2f3a;border:1px solid #75998a88;border-radius:11px;padding:5px;box-shadow:0 14px 28px #0007;}
.provider-option {width:100%;min-height:39px;display:flex;align-items:center;gap:10px;border-radius:7px;padding:7px 9px;font-size:12px;color:#d3e4ed;text-align:left;}
.provider-option:hover {background:#304b42;}
.provider-option.selected {background:#355444;color:#e7fff0;}
.provider-check {margin-left:auto;font-size:11px;color:transparent;}
.provider-option.selected .provider-check {color:#b3e3c9;}
.strategy-badge {display:inline-flex;align-items:center;gap:6px;border:1px solid #87b49a40;background:#243b302e;border-radius:6px;padding:3px 7px;}
.strategy-badge .provider-logo {width:14px;height:14px;}
.strategy-badge .provider-logo svg {width:14px;height:14px;}
.strategy-preview .strategy-badge strong {padding:0;border:0;background:none;}

.amount-explainer{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:10px;color:#9eb7c1;margin:8px 0 2px;font-variant-numeric:tabular-nums}.amount-explainer span:last-child{text-align:right}.risk-stake-summary{border:1px solid #7eae9550;background:#28413360;border-radius:8px;padding:10px;color:#bfe6d0;font-size:11px;line-height:1.6;margin:12px 0}.compact.mini .amount-explainer{font-size:9px;margin:2px 0 1px}.compact.mini #amount-rule{display:none}.compact.mini .hero{height:83px}.compact.mini #hero-status{display:none}
`;

  // lib/dg-panel-small.ts
  var DG_SMALL_CSS = `
#panel:not(.mini),#panel.compact:not(.mini){width:var(--full-width,280px);height:var(--full-height,560px);padding:14px;gap:8px;border-radius:15px;}
#panel:not(.mini) #head{height:64px;}
#panel:not(.mini) .topline{height:64px;grid-template-rows:28px 30px;gap:6px;}
#panel:not(.mini) .brand{font-size:14px;}
#panel:not(.mini) .tools #zoom-out{height:28px;font-size:10px;}
#panel:not(.mini) .tools #nav-overview,#panel:not(.mini) .tools #nav-settings,#panel:not(.mini) .tools #nav-logs{height:30px;font-size:11px;}
#panel:not(.mini) #overview-page{gap:7px;}
#panel:not(.mini) .parallel-control{height:30px;gap:8px;}
#panel:not(.mini) .parallel-control label{font-size:10px;}
#panel:not(.mini) .parallel-control select,#panel:not(.mini) .choose-tables{height:30px;font-size:11px;}
#panel:not(.mini) .mini-context{height:18px;font-size:10px;}
#panel:not(.mini) .mini-context strong{font-size:12px;}
#panel:not(.mini) .hero{min-height:0;gap:6px;}
#panel:not(.mini) .strategy-preview{margin-bottom:4px;}
#panel:not(.mini) .roomline{height:19px;font-size:12px;}
#panel:not(.mini) .amount-explainer{margin:5px 0 2px;font-size:9px;}
#panel:not(.mini) .bet-main{height:43px;margin:5px 0;gap:8px;}
#panel:not(.mini) .amount{font-size:32px;}
#panel:not(.mini) .amount.long-number{font-size:25px;}
#panel:not(.mini) .side{font-size:9px;padding:4px 5px;}
#panel:not(.mini) .ring{width:37px;height:37px;}
#panel:not(.mini) .ring-inner{font-size:12px;}
#panel:not(.mini) .meta{font-size:9px;min-height:15px;line-height:1.6;}
#panel:not(.mini) .statusline{font-size:10px;line-height:15px;max-height:30px;min-height:15px;}
#panel:not(.mini) .stats{height:50px;padding:9px 8px;}
#panel:not(.mini) .stats small{font-size:9px;margin-bottom:5px;}
#panel:not(.mini) .stats strong{font-size:14px;}
#panel:not(.mini) .stats>div+div{padding-left:7px;}
#panel:not(.mini) .chart-wrap{height:76px;padding:8px 8px 6px;}
#panel:not(.mini) .chart-head{font-size:9px;height:12px;}
#panel:not(.mini) .chart-head strong{font-size:10px;}
#panel:not(.mini) .chart{height:31px;margin:5px 0 3px;}
#panel:not(.mini) .chart-foot{font-size:8px;height:11px;}
#panel:not(.mini) .chart-empty{top:32px;font-size:9px;}
#panel:not(.mini) #table-strip{height:43px;min-height:43px;gap:6px;}
#panel:not(.mini) .table-chip{padding:6px 8px;min-width:104px;max-width:124px;}
#panel:not(.mini) .table-chip strong{font-size:10px;line-height:14px;}
#panel:not(.mini) .table-chip small{font-size:9px;line-height:14px;}
#panel:not(.mini)>.compact-actions{height:36px;min-height:36px;margin:0 0 5px;gap:8px;}
#panel:not(.mini)>.compact-actions button{height:36px;font-size:11px;}
#panel:not(.mini) .surface-heading .page-title{font-size:18px;}
#panel:not(.mini) .surface-heading{margin-bottom:7px;}
#panel:not(.mini) .surface-note{font-size:10px;margin-bottom:12px;}
#panel:not(.mini) .form-section{padding:11px;margin-bottom:10px;}
#panel:not(.mini) .form-section label{margin:10px 0 6px;font-size:10px;}
#panel:not(.mini) .form-section select,#panel:not(.mini) .form-section input:not([type=checkbox]){height:34px;font-size:11px;}
#panel:not(.mini) #provider-trigger{height:35px;font-size:11px;}
#panel:not(.mini) #rooms{gap:8px;}
#panel:not(.mini) #rooms .room{min-height:65px;padding:10px;gap:7px;}
#panel:not(.mini) .room-title strong{font-size:12px;}
#panel:not(.mini) .room-detail{font-size:9px;}
#panel:not(.mini) .selection-control{padding:10px;gap:7px;margin-bottom:10px;}
#panel:not(.mini) .rooms-back{height:35px;font-size:11px;margin-top:10px;}
.report-shell,.risk-overlay{width:var(--full-width,280px);height:var(--full-height,560px);padding:14px;}
.report-head{padding-bottom:10px;}
.report-head h2{font-size:18px;}
.report-filter{gap:7px;padding:10px 0;}
.report-filter select{height:30px;}
.report-filter>button{height:29px;}
.report-note{margin:7px 0 10px;}
.report-card{padding:10px;margin-bottom:9px;}
.report-footer{gap:8px;padding-top:9px;margin-top:8px;}
.report-footer button{height:30px;min-width:65px;}
.risk-card{padding:18px 14px 14px;}
.risk-emblem{width:62px;height:62px;border-radius:16px;margin-bottom:14px;}
.risk-card h2{font-size:18px;margin-bottom:12px;}
.risk-copy{font-size:11px;line-height:1.9;margin-bottom:14px;}
.risk-stake-summary{padding:8px;font-size:10px;margin:10px 0;}
.risk-ack{padding:10px 8px;font-size:10px;margin-bottom:14px;}
.risk-actions button{height:36px;font-size:11px;}
`;

  // lib/official-turnover-panel.ts
  var OFFICIAL_TURNOVER_HTML = `<section class="official-turnover" aria-label="\u5E73\u53F0\u5B98\u65B9\u6709\u6548\u4E0B\u6CE8\u6D41\u6C34">
  <div class="turnover-values"><div><small>\u4ECA\u65E5\u6D41\u6C34</small><strong id="official-today">\u5F85\u540C\u6B65</strong></div><div><small>\u8FD17\u65E5\u6D41\u6C34</small><strong id="official-week">\u5F85\u540C\u6B65</strong></div></div>
  <div class="turnover-footer"><span class="turnover-source" id="official-source">\u5B98\u65B9\u6709\u6548\u4E0B\u6CE8\u984D \xB7 \u975E\u672C\u5DE5\u5177\u6CE8\u984D\u4F30\u7B97</span><button id="official-refresh" type="button" aria-label="\u66F4\u65B0\u5E73\u53F0\u5B98\u65B9\u6709\u6548\u6D41\u6C34">\u66F4\u65B0</button></div>
</section>`;
  var OFFICIAL_TURNOVER_REPORT_HTML = `<div class="report-official-turnover"><small>\u5E73\u53F0\u5B98\u65B9\u6709\u6548\u4E0B\u6CE8\u6D41\u6C34</small><div><span>\u4ECA\u65E5 <strong id="report-official-today">\u5F85\u540C\u6B65</strong></span><span>\u8FD17\u65E5 <strong id="report-official-week">\u5F85\u540C\u6B65</strong></span></div><p id="report-official-source">\u8207\u4E0B\u65B9\u672C\u5DE5\u5177\u4E0B\u6CE8\u7D00\u9304\u5206\u958B\u7D71\u8A08</p></div>`;
  var OFFICIAL_TURNOVER_CSS = `
.official-turnover{flex:none;border:1px solid #637f8c38;border-radius:8px;background:#172b34;padding:7px 9px;margin:0;min-width:0;}
.turnover-values{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;}
.turnover-values small{display:block;font-size:9px;color:#aac1cb;margin-bottom:3px;}
.turnover-values strong{display:block;font-size:13px;line-height:17px;color:#d6ece4;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;}
.turnover-values>div+div{border-left:1px solid #607f8738;padding-left:12px;}
.turnover-footer{display:flex;align-items:center;gap:5px}.turnover-footer .turnover-source{flex:1;min-width:0}#official-refresh{flex:none;min-width:32px;min-height:26px;font-size:9px;border:1px solid #8cabb344;border-radius:5px;padding:3px 5px;background:#263f44;color:#c9e4df}.turnover-source{display:block;font-size:8px;line-height:12px;color:#98adb8;margin-top:4px;}
#panel.compact:not(.mini) .official-turnover{padding:6px 8px;}
#panel.compact:not(.mini) .chart-wrap{height:66px;}
#panel.compact:not(.mini) .chart{height:25px;margin:3px 0;}
#panel.compact:not(.mini) #table-strip{height:34px;min-height:34px;}
#panel.compact:not(.mini) .table-chip{padding:3px 6px;}
#panel.compact:not(.mini) #overview-page{overflow-y:auto!important;overscroll-behavior:contain;}
#panel.compact:not(.mini) .official-turnover{padding:4px 8px;}
#panel.compact:not(.mini) .turnover-values small{font-size:8px;line-height:9px;margin-bottom:2px;}
#panel.compact:not(.mini) .turnover-values strong{font-size:12px;line-height:15px;}
#panel.compact:not(.mini) .turnover-source{font-size:8px;line-height:9px;margin-top:2px;}
#panel.compact:not(.mini) .chart-summary{padding:5px 8px!important;}
#panel.compact:not(.mini) .chart{height:18px!important;margin:2px 0!important;}
#panel.compact:not(.mini) .hero{height:131px;min-height:131px;}
#panel.compact.mini .official-turnover{padding:3px 5px;border-radius:5px;background:transparent;border-color:#70899630;}
#panel.compact.mini .turnover-values{gap:6px;}
#panel.compact.mini .turnover-values>div+div{padding-left:6px;}
#panel.compact.mini .turnover-values small{font-size:8px;display:inline;margin-right:4px;}
#panel.compact.mini .turnover-values strong{display:inline;font-size:10px;line-height:14px;}
#panel.compact.mini .turnover-source{display:none;}
#panel.compact.mini .hero{height:92px;}
#panel.compact.mini .statusline{max-height:14px;min-height:14px;font-size:9px;line-height:14px;}
#panel.compact.mini #overview-page{gap:3px;}
#panel.compact.mini .mini-context{height:13px;min-height:13px;font-size:9px;}
#panel.compact.mini .hero{height:67px;min-height:67px;max-height:67px;}
#panel.compact.mini .stats{height:25px;min-height:25px;padding:3px 5px;}
#panel.compact.mini .stats small{font-size:7px;line-height:8px;margin-bottom:1px;}
#panel.compact.mini .stats strong{font-size:10px;line-height:11px;}
#panel.compact.mini .official-turnover{padding:2px 5px;min-height:25px;}
#panel.compact.mini .turnover-values small{display:block;font-size:7px;line-height:8px;margin:0;}
#panel.compact.mini .turnover-values strong{display:block;font-size:10px;line-height:11px;}
.report-official-turnover{flex:none;background:#172b34;border:1px solid #637f8c38;border-radius:8px;padding:8px 10px;margin:6px 0;}
.report-official-turnover>small{font-size:10px;color:#adc4cd;}
.report-official-turnover>div{display:flex;gap:14px;margin-top:5px;flex-wrap:wrap;font-size:10px;}
.report-official-turnover strong{font-size:12px;color:#d6ece4;font-variant-numeric:tabular-nums;}
.report-official-turnover p{font-size:9px;line-height:14px;color:#9eb7c3;margin:5px 0 0;}
`;
  function renderOfficialTurnover(shadow, view) {
    const q = (id) => shadow.getElementById(id);
    for (const period of ["today", "week"]) {
      const item = view?.[period];
      const known = item?.value !== null && item?.value !== void 0 && Number.isFinite(item.value);
      const text = known ? item.value.toLocaleString("zh-TW", { maximumFractionDigits: 2 }) : "\u5F85\u540C\u6B65";
      const title = item ? `${item.scope}\uFF5C${item.range}\uFF5C${item.status}${item.updatedAt ? `\uFF5C\u66F4\u65B0 ${new Date(item.updatedAt).toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei", hour12: false })}` : ""}` : "\u5F85\u540C\u6B65\u5B98\u65B9\u5831\u8868\uFF0C\u4E0D\u4EE5\u672C\u5DE5\u5177\u672C\u91D1\u63A8\u7B97";
      for (const id of [`official-${period}`, `report-official-${period}`]) {
        const element = q(id);
        if (element) {
          element.textContent = text;
          element.title = title;
        }
      }
    }
    const source = q("official-source");
    const note = q("report-official-source");
    if (source) {
      const pending = view && (view.today.value === null || view.week.value === null);
      source.textContent = pending ? view.today.status === view.week.status ? view.today.status : `\u4ECA\u65E5\uFF1A${view.today.status}\uFF5C\u8FD17\u65E5\uFF1A${view.week.status}` : "\u5B98\u65B9\u6709\u6548\u4E0B\u6CE8\u984D \xB7 \u975E\u672C\u5DE5\u5177\u6CE8\u984D\u4F30\u7B97";
      source.title = view ? `${view.today.scope}\uFF1B${view.today.status}\uFF1B${view.week.status}` : "\u7B49\u5F85\u5B98\u65B9\u4F86\u6E90";
    }
    if (note) note.textContent = `${view?.today.scope ?? "\u5B98\u65B9\u5831\u8868"}\uFF1B\u8FD17\u65E5\u4F9D\u5E73\u53F0\u671F\u9593\uFF0C\u8207\u672C\u5DE5\u5177\u4E0B\u6CE8\u7D00\u9304\u5206\u958B\u7D71\u8A08\u3002`;
  }

  // lib/dg-panel-view.ts
  var DG_PANEL_HTML = `<style>
:host{--fit:1;position:fixed;right:24px;top:24px;z-index:2147483647;color:#f4f3f5;font:12px -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif;color-scheme:dark}*{box-sizing:border-box}button,input,select{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #9fb68f;outline-offset:2px}button{border:0;background:none;color:inherit}[hidden]{display:none!important}#panel{width:290px;border-radius:22px;background:linear-gradient(155deg,#171619,#19171b 68%,#19191c);padding:13px 13px 16px;box-shadow:0 8px 28px #0005;transform:scale(var(--fit));transform-origin:top right;border:1px solid #ffffff08}#head{touch-action:none;cursor:grab;user-select:none}#head:active{cursor:grabbing}.topline{display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#989899;height:20px}.brand{display:flex;align-items:center;gap:5px}.dot{width:5px;height:5px;background:#6ca578;border-radius:50%;box-shadow:0 0 7px #72b78066}.tools{display:flex;gap:2px}.tools button{font-size:14px;width:25px;height:24px;background:#252327;border-radius:50%;color:#9d9296}.tools #hide{color:#b36157}.headline{display:flex;align-items:center;justify-content:space-between;margin:10px 0 14px}.title{font-size:21px;font-weight:760;letter-spacing:-.8px;margin:0}.balance{text-align:right}.balance small{display:block;color:#8a858d;font-size:8px;margin-bottom:3px}.balance strong{font-size:12px;font-variant-numeric:tabular-nums}.hero{padding:12px 12px 9px;background:radial-gradient(ellipse at 80% 8%,#28312a77,transparent 60%),linear-gradient(135deg,#262529,#242225);border-radius:15px}.hero-head{display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:11px}.pill{font-size:9px;background:#294e3540;color:#6dac7c;padding:4px 6px;border-radius:15px;white-space:nowrap}.pill.idle{background:#414047;color:#a9a5ae}.method{font-size:8px;color:#aba5ae;text-align:right}.roomline{font-weight:650;font-size:10px;display:flex;gap:7px;align-items:center}.subtle{font-size:8px;color:#8b858e;font-weight:400}.bet-main{display:flex;align-items:center;justify-content:space-between;gap:7px;margin:6px 0 4px}.bet-value{display:flex;align-items:center;gap:7px}.amount{font-size:31px;font-weight:800;line-height:1.2;letter-spacing:-1px;font-variant-numeric:tabular-nums}.side{color:#ee6e56;background:#783d3244;border-radius:7px;font-size:9px;padding:4px 5px;white-space:nowrap}.side.player{color:#84a5e9;background:#354d8244}.ring{--progress:0deg;width:49px;height:49px;flex:none;border-radius:50%;background:conic-gradient(#73997a var(--progress),#52565344 0);padding:2px;display:grid;place-items:center}.ring-inner{width:100%;height:100%;border-radius:50%;background:#292a29;display:grid;place-items:center;color:#afbab1;font-size:12px}.meta{color:#9d929f;font-size:8px;line-height:1.6;min-height:12px}.steps{display:flex;gap:4px;margin-top:12px}.step{flex:1;height:3px;background:#514a52}.step.active{background:#629d6e;box-shadow:0 0 5px #6c996633}.step-labels{display:flex;justify-content:space-between;color:#87828b;font-size:8px;margin:5px 0 16px}.step-labels b{color:#e1dddF;font-weight:600}.metrics{display:flex;justify-content:space-between;gap:5px}.metrics>div{flex:1}.metrics>div:nth-child(2){text-align:center}.metrics>div:last-child{text-align:right}.metrics small{font-size:8px;color:#a9a0aa;display:block;margin-bottom:4px}.metrics strong{font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}.meter{height:2px;background:#655a6244;margin:12px 0 11px;position:relative}.meter:after{content:"";position:absolute;left:50%;top:-2px;width:6px;height:6px;border-radius:50%;background:#a6a0a5}.main-action{width:100%;height:32px;border-radius:8px;font-weight:650;font-size:10px;background:#365140;color:#b7d3bd}.main-action.live{background:#5c302c;color:#d46b55}.action-mark{font-size:8px;margin-right:5px}.statusline{font-size:8px;line-height:1.5;color:#9e919f;margin-top:12px;min-height:14px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.section-head{display:flex;align-items:center;justify-content:space-between;margin:19px 0 8px;font-size:11px;font-weight:700}.gold{color:#bfa568;font-size:8px;font-weight:400}.stats{background:#242226;border-radius:11px;padding:12px;display:flex;justify-content:space-between;gap:5px}.stats>div{flex:1}.stats small{font-size:8px;color:#8f8794;display:block;margin-bottom:5px}.stats strong{font-size:12px;font-variant-numeric:tabular-nums}.green{color:#70b486!important}.red{color:#db7569!important}#tables{max-height:126px;overflow:auto;scrollbar-width:none}.table-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #ffffff07}.table-row:last-child{border-bottom:0}.table-badge{width:27px;height:27px;flex:none;border-radius:50%;background:#333138;color:#9fb29f;display:grid;place-items:center;font-size:9px}.table-info{flex:1;min-width:0}.table-info strong{font-size:9px}.table-info small{font-size:8px;color:#8b8391;display:block;margin-top:3px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.table-rec{text-align:right;white-space:nowrap;font-size:9px}.table-rec small{display:block;margin-top:3px;color:#8d8592;font-size:8px}.empty{padding:13px 0;color:#8b8490;font-size:9px}.footer{margin-top:10px;text-align:center;font-size:8px;color:#6f6876}.page-title{font-size:18px;margin:14px 0 5px}.page-caption{font-size:9px;color:#a49aa8;line-height:1.6;margin-bottom:13px}.form-body{max-height:460px;overflow:auto;scrollbar-width:thin;padding-right:2px}.form-body label{display:block;font-size:10px;color:#beb4c3;margin:12px 0 6px}.form-body select,.form-body input:not([type=checkbox]){width:100%;height:32px;background:#2b272e;border:1px solid #48404d;color:#e4dbe9;border-radius:7px;padding:6px 8px}.form-row{display:flex;gap:9px}.form-row>div{flex:1;min-width:0}.form-body .secondary{height:29px;border:1px solid #514657;border-radius:7px;font-size:10px;width:100%;color:#c3b7ce;background:#29232f}.scan-row{display:flex;gap:7px;align-items:center;margin:10px 0}.scan-row select{flex:1}.scan-row button{width:92px!important}#rooms{display:flex;flex-wrap:wrap;gap:5px}.room{border:1px solid #4f4459;border-radius:5px;font-size:9px;padding:5px 7px;background:#29232f}.room.active{border-color:#aa925c;background:#453b27;color:#e8daba}.ack{display:flex!important;align-items:flex-start;gap:5px;font-size:9px!important;line-height:1.6;margin:13px 0!important}.ack input{flex:none;margin:2px 0 0}.setting-actions{display:flex;gap:7px;margin-top:12px}.setting-actions button{flex:1;border-radius:7px;background:#35463a;height:31px;font-size:10px}.setting-actions #stop{background:#54312d;color:#db8277}.fineprint{font-size:8px;color:#8a7e94;line-height:1.6;margin-top:12px}.log-status{font-size:10px;color:#bcb29f;line-height:1.6;background:#252027;border-radius:9px;padding:10px;margin:12px 0}#events{white-space:pre-wrap;font-size:9px;color:#b0a5ba;line-height:1.8;max-height:430px;overflow:auto;overflow-wrap:anywhere;scrollbar-width:thin}#orb{width:43px;height:43px;border-radius:50%;display:grid;place-items:center;background:#f7f7f6;color:#999;box-shadow:0 0 0 4px #ffffff30,0 0 0 9px #ffffff17;font-size:10px;font-weight:700}#orb[hidden]{display:none}.titlebar{display:flex;align-items:center;gap:10px}.drag-mark{font-size:18px;color:#c1b8c5}.metrics .meter-value{font-size:10px}.range-view{width:100%;height:12px;accent-color:#70a87c;margin:6px 0 9px;cursor:default;pointer-events:none}.chart{width:100%;height:43px;display:block;margin-top:8px}.chart polyline{fill:none;stroke:#70b486;stroke-width:1.7;stroke-linejoin:round}.chart.red polyline{stroke:#da7569}.search-box{display:flex;justify-content:space-between;align-items:center;min-height:100px}.search-box strong{font-size:20px;letter-spacing:-.5px}.search-icon{width:48px;height:48px;border:2px solid #787d78;border-radius:50%;display:grid;place-items:center;color:#b4b7b4;font-size:22px}.search-note{font-size:8px;color:#928a98;line-height:1.7}.compact-actions{display:none;gap:8px;margin-top:10px}.compact-actions button{flex:1;background:#2c2930;border-radius:9px;height:33px;font-size:10px}.compact-actions #compact-stop{background:#512c29;color:#d77560}#panel.compact{width:276px;border-radius:15px;padding:10px 12px;background:#151518}.compact .headline,.compact .hero-head,.compact .main-action,.compact .section-head,.compact #tables,.compact .footer{display:none}.compact .hero{background:none;padding:7px 0 0;border-radius:0}.compact .bet-main{flex-direction:row-reverse;justify-content:flex-end;gap:12px}.compact .ring{width:44px;height:44px}.compact .bet-value{flex:1}.compact .amount{font-size:29px}.compact .steps{margin-top:10px}.compact .step-labels{margin-bottom:12px}.compact .meter{margin-top:9px}.compact .metrics{margin-top:11px}.compact .stats{border-radius:7px;margin-top:8px;padding:9px}.compact .stats small{font-size:7px}.compact .stats strong{font-size:11px}.compact .compact-actions{display:flex}.compact .chart{height:27px}.compact #hero-status{margin-top:6px}.compact .topline{height:24px}.compact .brand{color:#eee;font-weight:700;font-size:10px}.cards-result{margin:8px 0;padding:8px 5px;background:#17191b;border-radius:8px;display:flex;gap:8px}.cards-side{flex:1;min-width:0}.cards-side>small{font-size:8px;color:#96b1dc}.cards-side:last-child>small{color:#df8c84}.cards-side>strong{float:right;font-size:11px}.cards-line{display:flex;gap:4px;margin-top:6px}.playing-card{width:26px;height:36px;background:#e9e6e9;border-radius:3px;color:#222;font-size:10px;display:grid;place-items:center;background-position:center;background-size:contain;background-repeat:no-repeat}.cards-hint{font-size:7px;color:#8f8795;margin-top:4px}.report-shell{position:fixed;inset:6vh 5vw;z-index:2147483647;background:#141211;border:1px solid #645133;border-radius:11px;box-shadow:0 8px 40px #000b;color:#e6dcc8;display:flex;flex-direction:column;padding:18px;font-size:12px}.report-head{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #594626;padding-bottom:12px}.report-head h2{font-size:18px;margin:0}.report-head button{background:#403320;border-radius:5px;padding:7px 14px}.report-filter{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:15px 0}.report-filter label{font-size:11px}.report-filter select,.report-filter button{background:#292419;border:1px solid #594b31;border-radius:4px;padding:6px;color:#ddd2b7}.report-filter button.selected,.report-tabs button.selected{color:#e6bd67;border-color:#c89d42}.report-tabs{display:flex;gap:18px;border-bottom:1px solid #5d472c;margin-bottom:9px}.report-tabs button{padding:8px 0;font-size:12px;border-bottom:2px solid transparent;color:#9d9079}.report-note{font-size:10px;color:#9d9485;line-height:1.7;margin:5px 0 10px}.report-scroll{overflow:auto;flex:1;min-height:0}.report-grid{border-collapse:collapse;min-width:1040px;width:100%;font-size:11px}.report-grid th{background:#292013;color:#d9c89f;font-weight:500;white-space:nowrap;padding:10px 12px;text-align:left}.report-grid td{padding:10px 12px;border-bottom:1px solid #332a1d;white-space:nowrap}.report-footer{display:flex;justify-content:space-between;align-items:center;font-size:11px;margin-top:12px;color:#ae9a70}.report-footer button{padding:5px 10px;border:1px solid #655232;border-radius:5px}.report-empty{padding:40px;text-align:center;color:#ad9c86}.settings-added{font-size:9px;color:#a296a9;line-height:1.6;margin:8px 0}#settings-not-in-video{color:#b89c69}.back-report{font-size:10px}.compact #settings-page,.compact #logs-page{font-size:11px}#orb svg{width:20px;height:20px}#status{color:#a9a0b0}#stop-now{width:100%}@media(max-width:500px) and (orientation:portrait){:host{right:12px;top:20px}}
.chart-wrap{margin-top:10px;background:#19171d;border:1px solid #ffffff07;border-radius:8px;padding:8px 8px 5px;position:relative}.chart-head{display:flex;justify-content:space-between;font-size:8px;color:#93889e;gap:8px}.chart-head strong{font-size:9px;color:#b3a8bf}.chart{height:64px;margin-top:7px;overflow:visible}.chart .chart-grid{stroke:#ffffff0c;stroke-width:.6}.chart .chart-zero{stroke:#ffffff20;stroke-dasharray:3 3;stroke-width:.6}.chart .chart-area{fill:#6dba8526}.chart.red .chart-area{fill:#dd727526}.chart polyline{stroke-width:1.7;stroke-linecap:round}.chart .chart-dot{fill:#89c99b}.chart.red .chart-dot{fill:#df8a81}.chart-empty{font-size:9px;color:#8f849a;text-align:center;position:absolute;left:0;right:0;top:48px}.chart-foot{display:flex;justify-content:space-between;color:#756b7f;font-size:7px;margin-top:3px}.compact .chart{height:44px}.compact .chart-wrap{padding-top:6px}.compact .chart-empty{top:38px}
.parallel-control{display:flex;align-items:center;gap:10px;margin:0 0 10px}.parallel-control label{font-size:10px;color:#c5bcca;white-space:nowrap}.parallel-control select{flex:1;min-width:0;height:30px;border:1px solid #514658;border-radius:7px;padding:4px 7px;background:#2b272e;color:#f0e8f5;font-size:10px}.parallel-summary{color:#a69baa;font-size:8px;margin:-4px 0 10px}select:disabled{opacity:.65}.compact .parallel-control{margin-top:8px}.compact .parallel-summary{font-size:8px}
#panel,#panel.compact{width:276px;height:448px;padding:10px 12px;display:flex;flex-direction:column;overflow:hidden;border-radius:15px}#head{flex:none}#overview-page,#settings-page,#logs-page{flex:1;min-height:0;overflow:auto;scrollbar-width:thin;scrollbar-color:#514658 transparent}.form-body{max-height:none;overflow:visible}.compact .parallel-control{margin:3px 0 5px;gap:8px}.compact .parallel-control label{font-size:8px}.compact .parallel-control select{height:24px;font-size:9px}.compact .parallel-summary{margin:0 0 3px;font-size:7px}.compact .roomline{margin-top:2px}.compact .hero{padding:4px 0 0}.compact .bet-main{margin:4px 0 2px}.compact .steps{margin-top:7px}.compact .step-labels{margin:4px 0 9px}.compact .metrics{margin-top:4px}.compact .range-view{margin:3px 0 4px;height:9px}.compact .statusline{margin-top:5px;min-height:12px;font-size:7px}.compact .stats{padding:8px;margin-top:6px}.compact .chart-wrap{padding:6px 7px 4px;margin-top:6px}.compact .chart{height:39px;margin-top:5px}.compact .chart-foot{font-size:6px}.compact .compact-actions{margin-top:6px;position:sticky;bottom:0;background:#151518;padding-top:4px;padding-bottom:1px}.compact .compact-actions button{height:31px}.mini #overview-page{overflow:hidden}.mini .headline,.mini .metrics,.mini #pnl-range,.mini #chart-wrap,.mini .steps,.mini .step-labels,.mini .statusline,.mini #cards-result,.mini .section-head,.mini #tables,.mini #table-strip,.mini .footer,.mini .range-view{display:none}.mini .parallel-control{margin:3px 0 5px}.mini .parallel-summary{margin:0 0 4px}.mini .mini-context{margin:3px 0 5px}.mini .hero{padding:4px 0 0}.mini .bet-main{margin:4px 0 5px}.mini .compact-actions{display:flex;margin-top:5px;position:static}.mini .compact-actions button{height:31px}.report-shell{position:absolute;inset:auto;right:0;top:0;width:276px;height:448px;padding:10px;transform:scale(var(--fit));transform-origin:top right;border-radius:15px}.report-head h2{font-size:15px}.report-head button{padding:5px 8px;font-size:9px}.report-filter{gap:5px;margin:8px 0}.report-filter label{font-size:8px}.report-filter select,.report-filter button{padding:4px;font-size:8px}.report-tabs{gap:12px}.report-tabs button{font-size:10px}.report-note{font-size:8px}.report-footer{font-size:8px;gap:5px}.report-footer button{padding:4px;font-size:8px}.report-empty{padding:20px 8px}.report-grid{font-size:9px}.report-grid th,.report-grid td{padding:7px 8px}
${DG_DENSITY_CSS}
${DG_PRO_CSS}
${DG_SPACIOUS_CSS}
${DG_SURFACES_CSS}
${DG_SMALL_CSS}
${OFFICIAL_TURNOVER_CSS}
${DG_MOBILE_LAYOUT_CSS}
.doubling-reminder{border-left:3px solid #cba86a;border-radius:5px;padding:8px 9px;background:#a4793324;color:#e6c995;font-size:10px;line-height:1.6;margin:8px 0;}
</style>

<section id="panel">
<header id="head"><div class="topline"><span class="brand"><i class="dot"></i><span id="brand-count">\u767E\u5BB6\u5DE5\u7A0B\u5E2B</span></span><div class="tools"><button id="nav-mode" aria-label="\u5207\u63DB\u7E3D\u89BD\u8207\u5C0F\u7A97" title="\u5207\u63DB\u7E3D\u89BD\uFF0F\u767E\u5BB6\u5DE5\u7A0B\u5E2B"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16"/></svg></button><button id="nav-overview" aria-label="\u7E3D\u89BD" title="\u7E3D\u89BD"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10H3z M9 20v-7h6v7"/></svg><span>\u7E3D\u89BD</span></button><button id="nav-settings" aria-label="\u8A2D\u5B9A" title="\u8A2D\u5B9A"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2 3 3-1 2 3-2 3 2 3-2 3-3-1-2 3-2-3-3 1-2-3 2-3-2-3 2-3 3 1z"/><circle cx="12" cy="11" r="3"/></svg><span>\u8A2D\u5B9A</span></button><button id="nav-logs" aria-label="\u7D00\u9304" title="\u7D00\u9304"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14 M5 12h14 M5 18h14"/></svg><span>\u7D00\u9304</span></button><button id="zoom-out" aria-label="\u5207\u63DB\u8FF7\u4F60\u9762\u677F" title="\u5207\u63DB\u8FF7\u4F60\u9762\u677F"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg><span id="mini-label">\u8FF7\u4F60</span></button><button id="zoom-in" aria-label="\u653E\u5927\u9762\u677F" title="\u653E\u5927"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14 M12 5v14"/></svg></button><button id="hide" aria-label="\u6536\u5408" title="\u6536\u5408"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></div></div></header>
<div id="overview-page"><div class="headline"><div class="titlebar"><h1 class="title">\u7E3D\u89BD</h1><span class="drag-mark">\u2725</span></div><div class="balance"><small>\u5E73\u53F0\u9918\u984D</small><strong id="balance">\u2014</strong></div></div>
<div class="parallel-control"><label for="parallel-count">\u540C\u6642\u4E0B\u6CE8</label><select id="parallel-count" aria-label="\u540C\u6642\u4E0B\u6CE8\u684C\u6578"><option value="1" selected>1 \u684C</option><option value="3">3 \u684C</option><option value="5">5 \u684C</option><option value="all">\u6240\u6709\u5DF2\u8F09\u5165\u684C</option></select><button id="choose-tables" class="choose-tables">\u9078\u684C</button></div><div id="parallel-summary" class="parallel-summary">\u9010\u684C\u7368\u7ACB \xB7 \u4E0D\u7B49\u5176\u4ED6\u684C\u7D50\u7B97</div><div class="mini-context"><span id="mini-running">\u5DF2\u505C\u6B62</span><span>\u9918\u984D <strong id="mini-balance">\u2014</strong></span></div><div class="session-time" aria-label="\u672C\u6B21\u4F7F\u7528\u6642\u9593"><span>\u4F7F\u7528\u6642\u9593 <strong id="session-elapsed">00:00:00</strong></span><span id="session-remaining">\u4E0D\u9650\u6642</span></div><div class="hero"><div class="hero-head"><span id="run-pill" class="pill idle">\u25CF \u5DF2\u505C\u6B62</span><span id="method" class="method">\u7B56\u7565 \xB7 \u99AC\u4E01</span></div><div id="search-box" class="search-box" hidden><div><strong id="search-title">\u6311\u9078\u4E0B\u6CE8\u684C\u2026</strong><div class="search-note">\u7B49\u5F85\u9078\u5B9A\u684C\u53F0\u958B\u653E\u4E0B\u6CE8</div></div><span class="search-icon">\u2315</span></div><div id="target-box"><div class="strategy-preview"><span>\u7B56\u7565</span><span class="strategy-badge"><i id="main-strategy-logo" class="provider-logo" aria-hidden="true"></i><strong id="current-strategy">AI\u7D9C\u5408</strong></span></div><div class="roomline"><span id="focus-table">\u7B49\u5F85\u684C\u53F0</span><span id="focus-phase" class="subtle">\u6E96\u5099\u4E2D</span></div><div class="amount-explainer"><span id="amount-label">\u4E0B\u4E00\u6CE8\u9810\u89BD</span><span id="amount-rule">\u57FA\u672C 100 \xB7 \u7B2C1\u968E \xD71</span></div><div class="bet-main"><div class="bet-value"><strong id="amount" class="amount">100</strong><span id="side" class="side">\u2014</span></div><div id="ring" class="ring"><span id="countdown" class="ring-inner">\u2014</span></div></div><div id="focus-meta" class="meta">\u7B49\u5019\u771F\u5BE6\u724C\u8DEF\u8207\u5012\u6578</div><div class="steps"><i id="step-1" class="step"></i><i id="step-2" class="step"></i><i id="step-3" class="step"></i><i id="step-4" class="step"></i></div><div class="step-labels"><span>\u8B80\u53D6</span><span>\u7B49\u5F85\u63A5\u53D7</span><b>\u7D50\u7B97</b><span>\u7E8C\u6CE8</span></div></div><div id="cards-result" class="cards-result" hidden><div class="cards-side"><small>\u9592 PLAYER</small><strong id="player-point">\u2014</strong><div id="player-cards" class="cards-line"></div></div><div class="cards-side"><small>\u838A BANKER</small><strong id="banker-point">\u2014</strong><div id="banker-cards" class="cards-line"></div></div></div><div class="metrics"><div><small>\u7D2F\u8A08\u6700\u4F4E</small><strong id="range-low" class="meter-value">\u2014</strong></div><div><small>\u672C\u8F2A\u640D\u76CA</small><strong id="hero-pnl">0</strong></div><div><small>\u7D2F\u8A08\u6700\u9AD8</small><strong id="range-high" class="meter-value">\u2014</strong></div></div><input id="pnl-range" class="range-view" type="range" min="0" max="100" value="50" tabindex="-1" aria-label="\u672C\u8F2A\u7D50\u7B97\u5728\u986F\u793A\u7BC4\u570D\u5167\u7684\u4F4D\u7F6E" aria-readonly="true"><button id="stop-now" class="main-action"><span class="action-mark">\u25B6</span>\u958B\u59CB\u81EA\u52D5\u4E0B\u6CE8</button><div id="hero-status" class="statusline" role="button" tabindex="0" aria-label="\u67E5\u770B\u5B8C\u6574\u72C0\u614B">\u5C1A\u672A\u9001\u51FA\u4E0B\u6CE8</div></div>
<div class="section-head"><span>\u672C\u8F2A</span><button id="open-records" class="gold">\u8A18\u9304</button></div><div class="stats"><div><small>\u672C\u8F2A\u640D\u76CA</small><strong id="round-pnl">0</strong></div><div><small>\u8D0F\uFF0F\u8F38\uFF0F\u548C</small><strong id="round-wlt">0/0/0</strong></div><div><small>\u5BE6\u969B\u547D\u4E2D\u7387</small><strong id="hit-rate">\u2014</strong></div></div>${OFFICIAL_TURNOVER_HTML}<div id="chart-wrap" class="chart-wrap"><div class="chart-head"><span>\u7D2F\u8A08\u640D\u76CA\u8D70\u52E2</span><strong id="chart-last">\u2014</strong></div><svg id="pnl-chart" class="chart" viewBox="0 0 250 43" preserveAspectRatio="none" aria-label="\u672C\u8F2A\u5DF2\u7D50\u7B97\u640D\u76CA\u66F2\u7DDA"><path class="chart-grid" d="M0 4H250 M0 14H250 M0 25H250 M0 39H250 M0 4V39 M62 4V39 M125 4V39 M188 4V39 M250 4V39"/><line id="chart-zero" class="chart-zero" x1="0" x2="250" y1="22" y2="22"/><polygon id="chart-area" class="chart-area" points=""/><polyline id="pnl-line" points="0,22 250,22"/><circle id="chart-dot" class="chart-dot" cx="250" cy="22" r="1.6"/></svg><div id="chart-empty" class="chart-empty">\u7B49\u5F85\u9996\u7B46\u7D50\u7B97</div><div class="chart-foot"><span id="chart-low">\u6700\u4F4E \u2014</span><span id="chart-count">0 \u6CE8</span><span id="chart-high">\u6700\u9AD8 \u2014</span></div></div><div class="section-head"><span>\u5DF2\u9078\u684C\u53F0</span><button id="edit-rooms" class="gold">\u5168\u90E8</button></div><div id="tables"></div><div id="table-strip" aria-label="\u5DF2\u9078\u684C\u53F0"></div><div class="footer">\u63A8\u85A6\u50C5\u4F9B\u53C3\u8003</div></div>
<div id="settings-page" hidden><div class="surface-heading"><div><div class="surface-kicker">\u57F7\u884C\u53C3\u6578</div><h2 class="page-title">\u7B56\u7565\u8A2D\u5B9A</h2></div><span class="surface-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></svg></span></div><p class="surface-note">\u8A2D\u5B9A\u65B9\u5411\u4F86\u6E90\u3001\u55AE\u6CE8\u91D1\u984D\u8207\u505C\u6B62\u689D\u4EF6\u3002</p><div class="form-body">
<section class="form-section"><h3 class="form-section-head"><i>01</i>\u63A8\u85A6\u8207\u914D\u6CE8</h3><label for="single-staking">\u914D\u6CE8\u65B9\u5F0F</label><select id="single-staking"><option value="flat">\u5E73\u6CE8 \xB7 \u56FA\u5B9A\u984D</option><option value="martingale" selected>\u99AC\u4E01 \xB7 \u8F38\u5347\u968E</option><option value="doubling">\u500D\u6295 \xB7 \u8F38\u52A0\u500D</option></select><label for="start-mode">\u958B\u59CB\u65B9\u5F0F</label><select id="start-mode"><option value="fresh" selected>\u65B0\u958B\u59CB \xB7 \u57FA\u672C\u984D</option><option value="resume">\u7E8C\u63A5 \xB7 \u4FDD\u7559\u968E\u7D1A</option></select><div id="staking-hint" class="settings-added"></div><p id="doubling-reminder" class="doubling-reminder" hidden>\u4F7F\u7528\u500D\u6295\u6CD5\uFF0C\u8ACB\u8A2D\u5B9A\u6B62\u76C8\u8207\u6B62\u640D\uFF1B\u9023\u7E8C\u8667\u640D\u6703\u4F7F\u4E0B\u4E00\u6CE8\u52A0\u500D\u3002</p><label id="provider-label" for="provider-trigger">\u63A8\u85A6\u4F86\u6E90</label><div class="provider-picker"><select id="provider" hidden></select><button id="provider-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="provider-menu" aria-labelledby="provider-label provider-selected-name"><span id="provider-selected-logo" class="provider-logo" aria-hidden="true"></span><span id="provider-selected-name">AI\u7D9C\u5408</span><svg class="provider-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div id="provider-menu" role="listbox" aria-label="\u63A8\u85A6\u4F86\u6E90" hidden></div></div></section>
<section class="form-section"><h3 class="form-section-head"><i>02</i>\u6295\u6CE8\u91D1\u984D</h3><div class="form-row"><div><label for="base">\u57FA\u672C\u55AE\u6CE8</label><input id="base" type="number" min="1" value="100"></div><div><label for="cap">\u55AE\u7B46\u4E0A\u9650</label><input id="cap" type="number" min="1" value="100000"></div></div></section>
<section class="settings-added"><label for="duration-minutes">\u81EA\u52D5\u505C\u6B62\u6642\u9593\uFF08\u5206\u9418\uFF09</label><input id="duration-minutes" type="number" min="0" step="1" inputmode="numeric" value="0" placeholder="0\uFF1D\u4E0D\u9650\u6642"><p class="field-note">\u78BA\u8A8D\u958B\u59CB\u5F8C\u8A08\u6642\uFF0C\u5305\u542B\u627E\u684C\u53CA\u7B49\u5F85\u7D50\u7B97\u30020\u6216\u7559\u7A7A\u4E0D\u9650\u6642\uFF1B\u6642\u9593\u5230\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8\uFF0C\u5DF2\u63A5\u53D7\u6CE8\u55AE\u7E7C\u7E8C\u7D50\u7B97\u3002\u6BCF\u6B21\u91CD\u65B0\u958B\u59CB\u6703\u91CD\u65B0\u8A08\u6642\u3002</p></section><section class="form-section"><h3 class="form-section-head"><i>03</i>\u6B62\u640D\u8207\u6B62\u76C8</h3><div class="form-row"><div><label for="stop-loss">\u6B62\u640D\u91D1\u984D</label><input id="stop-loss" type="number" min="1" placeholder="\u672A\u8A2D\u5B9A"></div><div><label for="take-profit">\u6B62\u76C8\u91D1\u984D</label><input id="take-profit" type="number" min="1" placeholder="\u672A\u8A2D\u5B9A"></div></div><p class="field-note">\u9054\u5230\u672C\u8F2A\u6B62\u640D\u6216\u6B62\u76C8\u5373\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8\u3002\u9001\u55AE\u524D\u4E5F\u6838\u5C0D\u4E0B\u4E00\u6CE8\u53CA\u5F85\u7D50\u7B97\u672C\u91D1\uFF0C\u53EF\u80FD\u8D85\u904E\u6B62\u640D\u5C31\u4E0D\u6253\u3002\u99AC\u4E01\u6B62\u640D\u6700\u4F4E2,600\u4E14\u4E0D\u53EF\u7559\u7A7A\uFF1B\u5168\u6578\u7D50\u7B97\u5F8C\u9078\u65B0\u958B\u59CB\u53EF\u91CD\u65B0\u8A08\u7B97\u3002</p></section>
<span id="zoom-label" hidden>100%</span><input id="zoom" type="range" min="70" max="180" step="10" value="100" hidden><input id="range-min" hidden value=""><input id="range-max" hidden value=""><select id="scope" hidden disabled><option value="table" selected>\u9010\u684C\u7368\u7ACB</option></select><select id="count" hidden><option value="1">1</option><option value="3">3</option><option value="5">5</option><option value="all">all</option></select><button id="scan" hidden></button><div hidden><button id="start"></button><button id="once"></button><button id="stop"></button></div></div></div>
<div id="rooms-page" hidden><div class="surface-heading"><div><div class="surface-kicker">\u4E0B\u6CE8\u7BC4\u570D</div><h2 class="page-title">\u9078\u64C7\u684C\u53F0</h2></div><span class="surface-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span></div><div class="selection-control"><span id="selection-mode">\u81EA\u52D5\u627E\u684C \xB7 \u958B\u653E\u4E0B\u6CE8\u5C31\u52A0\u5165</span><button id="auto-tables">\u81EA\u52D5\u627E\u684C\u4E2D</button></div><div id="rooms-hint" class="surface-note page-caption">\u5148\u53D6\u6D88\u4E00\u684C\uFF0C\u518D\u9078\u5176\u4ED6\u684C\u3002</div><div id="rooms"></div><button id="rooms-back" class="rooms-back">\u5B8C\u6210\u9078\u64C7\uFF0C\u56DE\u5230\u7E3D\u89BD</button></div><div id="logs-page" hidden><div class="surface-heading"><div><div class="surface-kicker">\u72C0\u614B\u8207\u7D50\u7B97</div><h2 class="page-title">\u57F7\u884C\u7D00\u9304</h2></div><span class="surface-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v18H7zM10 8h4M10 12h4M10 16h4"/></svg></span></div><p class="surface-note">\u4F9D\u5E8F\u67E5\u770B\u9001\u51FA\u3001\u63A5\u53D7\u53CA\u7D50\u7B97\u4E8B\u4EF6\u3002</p><div class="log-status"><span class="log-label">\u76EE\u524D\u72C0\u614B</span><div id="status"></div></div><button id="last-usage" aria-label="\u67E5\u770B\u4F7F\u7528\u7D00\u9304" style="flex:none;width:100%;margin:6px 0;padding:6px;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">\u5C1A\u7121\u4E0A\u6B21\u4F7F\u7528\u7D00\u9304</button><div id="events" aria-label="\u64CD\u4F5C\u4E8B\u4EF6\u6642\u9593\u8EF8"></div></div>
<div class="compact-actions"><button id="open-report">\u6253\u958B\u6230\u7E3E</button><button id="compact-stop">\u505C\u6B62</button></div><button id="resize-panel" class="resize-grip" aria-label="\u62D6\u66F3\u8ABF\u6574\u9762\u677F\u5C3A\u5BF8" title="\u62D6\u66F3\u8ABF\u6574\u5927\u5C0F\uFF1B\u65B9\u5411\u9375\u5FAE\u8ABF"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19 19 9M14 19 19 14M19 19h.01"/></svg></button></section><section id="risk-dialog" class="risk-overlay" role="dialog" aria-modal="true" aria-labelledby="risk-title" hidden><div class="risk-card"><div class="risk-emblem"><svg class="risk-triangle" viewBox="0 0 80 72" aria-hidden="true"><path d="M40 5 75 65H5Z"/><path class="risk-mark" d="M40 24v20"/><circle class="risk-point" cx="40" cy="54" r="3"/></svg></div><h2 id="risk-title">${DG_RISK_STATEMENT.title}</h2><p class="risk-copy">${DG_RISK_STATEMENT.text}</p><p class="risk-copy risk-record-notice">${DG_RISK_STATEMENT.recordNotice}</p><div id="risk-stake-summary" class="risk-stake-summary" hidden></div><p id="risk-time-summary" class="field-note"></p><p id="risk-doubling-warning" class="doubling-reminder" hidden></p><label class="risk-ack"><input id="ack" type="checkbox"><span>${DG_RISK_STATEMENT.acknowledgement}</span></label><p id="risk-record-state" class="field-note" aria-live="polite"></p><div class="risk-actions"><button id="risk-cancel">\u53D6\u6D88</button><button id="risk-confirm" disabled>\u78BA\u8A8D\u958B\u59CB</button></div></div></section><section id="report-shell" class="report-shell" hidden><header class="report-head"><div><div class="surface-kicker">\u672C\u5DE5\u5177\u8A18\u9304</div><h2>\u4E0B\u6CE8\u6230\u7E3E</h2></div><button id="close-report">\u8FD4\u56DE\u7E3D\u89BD</button></header><div class="report-filter"><label>\u904A\u6232\u5927\u5EF3 <select id="report-lobby"><option value="all">\u5168\u90E8</option><option value="DG">DG</option></select></label><label>\u904A\u6232\u985E\u578B <select id="report-game"><option value="all">\u5168\u90E8</option><option value="baccarat">\u767E\u5BB6\u6A02</option></select></label><button id="report-today" class="selected">\u4ECA\u65E5</button><button id="report-yesterday">\u6628\u65E5</button><button id="report-week">\u4E03\u65E5</button></div><div class="report-tabs"><button id="report-bets" class="selected">\u6295\u6CE8\u8A18\u9304</button><button id="report-usage">\u4F7F\u7528\u7D00\u9304</button><button id="report-transactions" hidden>\u4EA4\u6613\u8A18\u9304</button></div><div id="report-note" class="report-note">\u672C\u5DE5\u5177\u8A18\u9304\u7684\u4E0B\u6CE8\u8207\u7D50\u679C</div>${OFFICIAL_TURNOVER_REPORT_HTML}<div class="report-scroll"><div id="report-body" class="report-cards"></div><div id="report-empty" class="report-empty" hidden>\u5C1A\u7121\u8A18\u9304</div></div><footer class="report-footer"><span id="report-total">\u5408\u8A08 \u2014</span><span><button id="report-prev">\u4E0A\u4E00\u9801</button> <span id="report-page">1 / 1</span> <button id="report-next">\u4E0B\u4E00\u9801</button></span></footer><button id="resize-report" class="resize-grip" aria-label="\u62D6\u66F3\u8ABF\u6574\u9762\u677F\u5C3A\u5BF8" title="\u62D6\u66F3\u8ABF\u6574\u5927\u5C0F\uFF1B\u65B9\u5411\u9375\u5FAE\u8ABF"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19 19 9M14 19 19 14M19 19h.01"/></svg></button></section>`;

  // lib/dg-panel-data.ts
  function cumulativePoints(bets, width = 250, height = 43) {
    const ordered = bets.filter((b) => b.state === "settled" && Number.isFinite(b.pnl)).slice().sort((a, b) => (a.settledAt ?? a.acceptedAt ?? a.createdAt) - (b.settledAt ?? b.acceptedAt ?? b.createdAt));
    if (!ordered.length) return `0,${height / 2} ${width},${height / 2}`;
    let sum = 0;
    const values = [0, ...ordered.map((b) => sum += b.pnl ?? 0)];
    const low = Math.min(...values), high = Math.max(...values), span = high - low || 1;
    return values.map((v, i) => `${(i / Math.max(1, values.length - 1) * width).toFixed(1)},${(height - 4 - (v - low) / span * (height - 8)).toFixed(1)}`).join(" ");
  }
  function chartSummary(bets) {
    const ordered = bets.filter((b) => b.state === "settled" && Number.isFinite(b.pnl)).slice().sort((a, b) => (a.settledAt ?? a.acceptedAt ?? a.createdAt) - (b.settledAt ?? b.acceptedAt ?? b.createdAt));
    let total = 0;
    const values = [0, ...ordered.map((b) => total += b.pnl ?? 0)];
    return { count: ordered.length, total, low: Math.min(...values), high: Math.max(...values) };
  }
  function periodBets(bets, period, now = Date.now()) {
    const day = 864e5, offset = 288e5, start = Math.floor((now + offset) / day) * day - offset;
    const from = period === "yesterday" ? start - day : period === "week" ? start - 6 * day : start;
    const until = period === "yesterday" ? start : start + day;
    return bets.filter((b) => b.createdAt >= from && b.createdAt < until && ["submitted", "accepted", "rejected", "uncertain", "settled"].includes(b.state));
  }
  function rangePosition(pnl, lowText, highText) {
    if (!lowText.trim() || !highText.trim()) return null;
    const low = Number(lowText), high = Number(highText);
    if (!Number.isFinite(low) || !Number.isFinite(high) || low >= high) return null;
    return Math.max(0, Math.min(100, (pnl - low) / (high - low) * 100));
  }
  function knownPoker(raw) {
    let obj = raw;
    try {
      if (typeof raw === "string") obj = JSON.parse(raw);
    } catch {
      return null;
    }
    if (!obj || typeof obj.player !== "string" || typeof obj.banker !== "string") return null;
    const parse3 = (v) => v.split("-").map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 52).slice(0, 3);
    const player = parse3(obj.player), banker = parse3(obj.banker);
    return player.length || banker.length ? { player, banker } : null;
  }
  function pokerRank(id) {
    const n = id % 13 || 13;
    return n === 1 ? "A" : n === 11 ? "J" : n === 12 ? "Q" : n === 13 ? "K" : String(n);
  }
  function pokerPoint(ids) {
    return ids.reduce((s, id) => s + Math.min(id % 13 || 13, 10) % 10, 0) % 10;
  }

  // lib/dg-limit-check.ts
  var numeric = (v) => v == null || v === "" || typeof v === "boolean" || !Number.isFinite(Number(v)) ? null : Number(v);
  var usable = (v) => numeric(v?.bpMin) != null && Number(v.bpMin) >= 0 && numeric(v?.bpMax) != null && Number(v.bpMax) > 0 && Number(v.bpMax) >= Number(v.bpMin);
  function readDgLimits(card) {
    const player = card.playerInfo, limitId = numeric(card.limitId), gameId = numeric(card.gameInfo?.gameId);
    let value = card.baccaratLimit ?? card.gameLimit, source = "\u684C\u53F0\u5FEB\u53D6";
    if (limitId != null && limitId >= 1 && gameId != null && typeof player?.gameLimitMan?.getGameLimit === "function") {
      try {
        const current = player.gameLimitMan.getGameLimit(limitId, gameId);
        if (usable(current)) {
          value = current;
          source = "DG\u539F\u751F\u9650\u984D\u7BA1\u7406\u5668";
        }
      } catch {
      }
    }
    const min = numeric(value?.bpMin), max = numeric(value?.bpMax), balance = numeric(player?.balance);
    return { source, limitId, gameId, min, max, balance, available: usable(value) };
  }
  function checkDgAmount(card, amount) {
    const limits = readDgLimits(card);
    const result = (ok, code, reason) => ({ ok, code, reason, limits });
    if (!Number.isSafeInteger(amount) || amount <= 0) return result(false, "invalid-amount", "\u4E0B\u6CE8\u91D1\u984D\u4E0D\u662F\u6B63\u6574\u6578");
    if (!limits.available) return result(false, "limits-unready", `\u838A\u9592\u9650\u984D\u5C1A\u672A\u540C\u6B65\uFF08\u6700\u4F4E ${limits.min ?? "\u672A\u63D0\u4F9B"}\uFF0F\u6700\u9AD8 ${limits.max ?? "\u672A\u63D0\u4F9B"}\uFF09\uFF1B\u7B49\u5019\uFF0C\u4E0D\u6539\u91D1\u984D`);
    if (amount < limits.min) return result(false, "below-min", `\u91D1\u984D ${amount} \u4F4E\u65BC\u5E73\u53F0\u6700\u4F4E ${limits.min}\uFF08\u6700\u9AD8 ${limits.max}\uFF09\uFF1B\u672A\u9001\u51FA\uFF0C\u4E0D\u81EA\u52D5\u52A0\u6CE8`);
    if (amount > limits.max) return result(false, "above-max", `\u91D1\u984D ${amount} \u9AD8\u65BC\u5E73\u53F0\u6700\u9AD8 ${limits.max}\uFF08\u6700\u4F4E ${limits.min}\uFF09\uFF1B\u672A\u9001\u51FA`);
    if (limits.balance == null) return result(false, "balance-unready", "\u5E73\u53F0\u9918\u984D\u5C1A\u672A\u63D0\u4F9B\uFF1B\u7B49\u5019\uFF0C\u4E0D\u9001\u51FA");
    if (amount > limits.balance) return result(false, "insufficient-balance", `\u91D1\u984D ${amount} \u8D85\u904E\u76EE\u524D\u9918\u984D ${limits.balance}\uFF1B\u672A\u9001\u51FA`);
    return result(true, "ok", `\u91D1\u984D ${amount} \u7B26\u5408\u9650\u984D ${limits.min}\u2013${limits.max}\uFF0F\u9918\u984D ${limits.balance}`);
  }

  // lib/dg-risk-limits.ts
  function parseRiskLimits(lossText, profitText) {
    function parse3(text, label) {
      if (!text.trim()) return null;
      const value = Number(text);
      if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`${label}\u5FC5\u9808\u662F\u6B63\u6574\u6578\u91D1\u984D\uFF0C\u6216\u7559\u7A7A\u505C\u7528`);
      return value;
    }
    return { stopLoss: parse3(lossText, "\u6B62\u640D"), takeProfit: parse3(profitText, "\u6B62\u76C8") };
  }
  function riskStopReason(pnl, limits) {
    if (!Number.isFinite(pnl)) throw new Error("\u7D2F\u8A08\u640D\u76CA\u8CC7\u6599\u7121\u6548");
    const fmt = (n) => n.toLocaleString("zh-TW");
    if (limits.stopLoss != null && pnl <= -limits.stopLoss) return `\u5DF2\u9054\u6B62\u640D ${fmt(limits.stopLoss)}\uFF1A\u672C\u8F2A\u640D\u76CA ${fmt(pnl)}\uFF0C\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8`;
    if (limits.takeProfit != null && pnl >= limits.takeProfit) return `\u5DF2\u9054\u6B62\u76C8 ${fmt(limits.takeProfit)}\uFF1A\u672C\u8F2A\u640D\u76CA +${fmt(pnl)}\uFF0C\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8`;
    return null;
  }
  function nextStakeRiskCheck(pnl, limits, pending, nextAmount, ownReservation) {
    if (!Number.isFinite(pnl) || !Number.isSafeInteger(nextAmount) || nextAmount <= 0) throw new Error("\u9001\u55AE\u524D\u640D\u76CA\u6216\u4E0B\u6CE8\u91D1\u984D\u7121\u6548");
    const exposure = pending.filter((b) => b.key !== ownReservation).reduce((sum, b) => {
      if (!Number.isSafeInteger(b.amount) || b.amount <= 0) throw new Error("\u5F85\u7D50\u7B97\u91D1\u984D\u7121\u6548\uFF0C\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8");
      return sum + b.amount;
    }, 0);
    if (!Number.isSafeInteger(exposure)) throw new Error("\u5F85\u7D50\u7B97\u7E3D\u984D\u8D85\u51FA\u53EF\u7528\u7BC4\u570D");
    if (limits.stopLoss === null) return { ok: true, remaining: null, exposure, reason: null };
    if (!Number.isSafeInteger(limits.stopLoss) || limits.stopLoss <= 0) throw new Error("\u6B62\u640D\u8A2D\u5B9A\u7121\u6548");
    const remaining = limits.stopLoss + pnl - exposure;
    const ok = nextAmount <= remaining;
    const fmt = (n) => n.toLocaleString("zh-TW");
    return { ok, remaining, exposure, reason: ok ? null : `\u4E0B\u4E00\u6CE8 ${fmt(nextAmount)} \u52A0\u4E0A\u5F85\u7D50\u7B97 ${fmt(exposure)}\uFF0C\u53EF\u80FD\u8D85\u904E\u6B62\u640D ${fmt(limits.stopLoss)}\uFF08\u672C\u8F2A\u640D\u76CA ${fmt(pnl)}\u3001\u5269\u9918\u984D\u5EA6 ${fmt(Math.max(0, remaining))}\uFF09\uFF1B\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8` };
  }

  // lib/dg-table-selection.ts
  function syncDgTables(loadedIds, selectedIds, pendingIds, count) {
    const loaded = [...new Set(loadedIds.filter(Boolean))];
    const available = new Set(loaded);
    const pending = new Set(pendingIds);
    const retained = [...new Set(selectedIds)].filter((id) => available.has(id) || pending.has(id));
    const limit = count === "all" ? Infinity : Number(count);
    const next = retained.slice(0, limit);
    for (const id of loaded) {
      if (next.length >= limit) break;
      if (!next.includes(id)) next.push(id);
    }
    return next;
  }
  function selectOpenDgTables(eligibleIds, pendingIds, count) {
    const pending = [...new Set(pendingIds.filter(Boolean))];
    const eligible = [...new Set(eligibleIds.filter(Boolean))];
    const limit = count === "all" ? Infinity : Number(count);
    const next = [...pending];
    for (const id of eligible) {
      if (next.length >= limit) break;
      if (!next.includes(id)) next.push(id);
    }
    return next;
  }

  // lib/dg-button-feedback.ts
  function installDgButtonFeedback(root) {
    const timers = /* @__PURE__ */ new Map();
    let held = null;
    function button(event) {
      const node = event.target instanceof Element ? event.target.closest('button,[role="button"]') : null;
      return node && !(node instanceof HTMLButtonElement && node.disabled) ? node : null;
    }
    function clear(node) {
      const timer = timers.get(node);
      if (timer) clearTimeout(timer);
      timers.delete(node);
      node.removeAttribute("data-pressed");
    }
    function release() {
      if (held) clear(held);
      held = null;
    }
    function press(event) {
      release();
      held = button(event);
      if (held) held.dataset.pressed = "true";
    }
    function keydown(event) {
      const e = event;
      if (e.key === "Enter" || e.key === " ") press(e);
    }
    function keyup(event) {
      const e = event;
      if (e.key === "Enter" || e.key === " ") release();
    }
    function click(event) {
      const node = button(event);
      if (!node) return;
      clear(node);
      node.dataset.pressed = "true";
      timers.set(node, setTimeout(() => clear(node), 160));
    }
    root.addEventListener("pointerdown", press, true);
    root.addEventListener("pointerup", release, true);
    root.addEventListener("pointercancel", release, true);
    root.addEventListener("pointerout", release, true);
    root.addEventListener("keydown", keydown, true);
    root.addEventListener("keyup", keyup, true);
    root.addEventListener("click", click, true);
    return () => {
      release();
      for (const node of [...timers.keys()]) clear(node);
      root.removeEventListener("pointerdown", press, true);
      root.removeEventListener("pointerup", release, true);
      root.removeEventListener("pointercancel", release, true);
      root.removeEventListener("pointerout", release, true);
      root.removeEventListener("keydown", keydown, true);
      root.removeEventListener("keyup", keyup, true);
      root.removeEventListener("click", click, true);
    };
  }

  // lib/dg-panel-resize.ts
  function installDgPanelResize(handles, options) {
    const cleanups = [];
    for (const handle of handles) {
      let down2 = function(e) {
        if (e.button !== 0 && e.pointerType === "mouse") return;
        e.preventDefault();
        e.stopPropagation();
        const target = handle.parentElement;
        const size = options.getSize(target);
        options.prepare(target);
        active = { id: e.pointerId, x: e.clientX, y: e.clientY, size };
        try {
          handle.setPointerCapture?.(e.pointerId);
        } catch {
        }
        handle.dataset.resizing = "true";
      }, move2 = function(e) {
        if (!active || active.id !== e.pointerId) return;
        e.preventDefault();
        const fit = Math.max(0.2, active.size.scale);
        options.apply(
          Math.max(260, Math.min(520, active.size.width + (e.clientX - active.x) / fit)),
          Math.max(360, Math.min(900, active.size.height + (e.clientY - active.y) / fit))
        );
      }, end2 = function(e) {
        if (!active || active.id !== e.pointerId) return;
        if (handle.hasPointerCapture?.(e.pointerId)) handle.releasePointerCapture(e.pointerId);
        active = null;
        delete handle.dataset.resizing;
      }, key2 = function(e) {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
        e.preventDefault();
        const size = options.getSize(handle.parentElement);
        options.prepare(handle.parentElement);
        const delta = e.shiftKey ? 30 : 10;
        options.apply(
          Math.max(260, Math.min(520, size.width + (e.key === "ArrowRight" ? delta : e.key === "ArrowLeft" ? -delta : 0))),
          Math.max(360, Math.min(900, size.height + (e.key === "ArrowDown" ? delta : e.key === "ArrowUp" ? -delta : 0)))
        );
      }, lost2 = function() {
        active = null;
        delete handle.dataset.resizing;
      };
      var down = down2, move = move2, end = end2, key = key2, lost = lost2;
      let active = null;
      handle.addEventListener("pointerdown", down2);
      handle.addEventListener("pointermove", move2);
      handle.addEventListener("pointerup", end2);
      handle.addEventListener("pointercancel", end2);
      handle.addEventListener("lostpointercapture", lost2);
      handle.addEventListener("keydown", key2);
      cleanups.push(() => {
        active = null;
        delete handle.dataset.resizing;
        handle.removeEventListener("pointerdown", down2);
        handle.removeEventListener("pointermove", move2);
        handle.removeEventListener("pointerup", end2);
        handle.removeEventListener("pointercancel", end2);
        handle.removeEventListener("keydown", key2);
        handle.removeEventListener("lostpointercapture", lost2);
      });
    }
    return () => cleanups.forEach((cleanup) => cleanup());
  }

  // lib/dg-provider-logos.ts
  var DG_PROVIDER_LOGOS = { "chatgpt": '<svg fill="currentColor" fill-rule="evenodd" height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>OpenAI</title><path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z"></path></svg>', "gemini": '<svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Gemini</title><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="#3186FF"></path><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#lobe-icons-gemini-0-_R_0_)"></path><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#lobe-icons-gemini-1-_R_0_)"></path><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#lobe-icons-gemini-2-_R_0_)"></path><defs><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-gemini-0-_R_0_" x1="7" x2="11" y1="15.5" y2="12"><stop stop-color="#08B962"></stop><stop offset="1" stop-color="#08B962" stop-opacity="0"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-gemini-1-_R_0_" x1="8" x2="11.5" y1="5.5" y2="11"><stop stop-color="#F94543"></stop><stop offset="1" stop-color="#F94543" stop-opacity="0"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-gemini-2-_R_0_" x1="3.5" x2="17.5" y1="13.5" y2="12"><stop stop-color="#FABC12"></stop><stop offset=".46" stop-color="#FABC12" stop-opacity="0"></stop></linearGradient></defs></svg>', "grok": '<svg fill="currentColor" fill-rule="evenodd" height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Grok</title><path d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815"></path></svg>', "meta": '<svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>MetaAI</title><path d="M10.547.232c.776-.086 1.543.244 2.152.712.784.598 1.375 1.434 1.757 2.347.19.444.3.92.345 1.402.01.384.024.781-.108 1.148-.126.406-.362.795-.728 1.017-.352.236-.786.3-1.199.288-.84-.073-1.613-.52-2.212-1.106-.15-.1-.236-.263-.368-.38-.801-.97-1.394-2.203-1.324-3.496.048-.698.38-1.44 1.03-1.75.206-.1.428-.164.655-.182z" fill="url(#lobe-icons-meta-ai-0-_R_0_)"></path><path d="M18.595 3.077c.52-.045 1.032.186 1.4.551.402.434.625 1.006.736 1.584.096.605.09 1.233-.048 1.83a5.97 5.97 0 01-.907 2.19c-.198.25-.382.519-.633.719-.493.45-1.181.725-1.848.598-.42-.08-.819-.306-1.085-.646-.514-.591-.687-1.403-.714-2.17a6.11 6.11 0 011.03-3.285c.237-.314.49-.62.797-.867.375-.27.805-.486 1.272-.504z" fill="url(#lobe-icons-meta-ai-1-_R_0_)"></path><path d="M5.038 4.172c.618-.045 1.238.067 1.832.235.871.28 1.741.78 2.182 1.624.177.383.256.826.152 1.242-.097.442-.375.816-.71 1.105-.724.59-1.664.84-2.577.887a5.356 5.356 0 01-2.881-.675c-.39-.248-.765-.539-1.025-.93a1.9 1.9 0 01-.327-1.283c.067-.507.357-.968.741-1.289.723-.62 1.684-.873 2.613-.916z" fill="url(#lobe-icons-meta-ai-2-_R_0_)"></path><path d="M4.87 10.369c.69-.06 1.465.223 1.811.866.213.349.278.763.29 1.166.006.528-.136 1.046-.34 1.529-.34.793-.893 1.478-1.538 2.036-.64.538-1.42.951-2.26 1.015a2.031 2.031 0 01-1.467-.398c-.353-.281-.578-.707-.662-1.15-.156-.8.077-1.62.445-2.327.196-.377.444-.724.72-1.044.767-.886 1.814-1.608 3.001-1.693z" fill="url(#lobe-icons-meta-ai-3-_R_0_)"></path><path d="M20.391 11.05c.881-.087 1.872.116 2.477.822.473.58.534 1.425.239 2.102-.118.317-.32.59-.527.852-.877.962-2.11 1.553-3.379 1.744-.818.123-1.723.036-2.406-.477-.2-.161-.386-.346-.514-.573-.277-.436-.321-.994-.216-1.492.224-.904.92-1.594 1.676-2.073a5.874 5.874 0 012.65-.905z" fill="url(#lobe-icons-meta-ai-4-_R_0_)"></path><path d="M7.553 15.523c.381-.052.775.004 1.118.184.344.154.613.427.866.702.866 1.097 1.267 2.549 1.146 3.944a4.476 4.476 0 01-.497 1.61c-.273.469-.663.91-1.187 1.08-.35.103-.731.118-1.077-.005a2.53 2.53 0 01-.959-.612c-.798-.859-1.236-2.02-1.343-3.185-.055-.646-.006-1.31.21-1.923.146-.471.384-.92.738-1.265.261-.277.62-.452.985-.53z" fill="url(#lobe-icons-meta-ai-5-_R_0_)"></path><path d="M13.637 16.5a4.237 4.237 0 011.82.219c.795.286 1.542.724 2.148 1.323.535.504.963 1.162 1.099 1.899.055.379.038.785-.122 1.138-.19.465-.599.807-1.051.996-.883.364-1.887.253-2.76-.082a5.568 5.568 0 01-2.343-1.685c-.347-.445-.616-.968-.697-1.534-.042-.382-.036-.788.13-1.142.194-.418.55-.76.978-.925.25-.119.525-.174.798-.207z" fill="url(#lobe-icons-meta-ai-6-_R_0_)"></path><defs><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-0-_R_0_" x1="9.789" x2="13" y1="0" y2="7.5"><stop stop-color="#C65EFF"></stop><stop offset=".5" stop-color="#EA4FFF"></stop><stop offset="1" stop-color="#9553FF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-1-_R_0_" x1="19" x2="17" y1="3" y2="10.5"><stop stop-color="#CF72FF"></stop><stop offset=".5" stop-color="#E541FF"></stop><stop offset="1" stop-color="#944DFF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-2-_R_0_" x1="9" x2="2.5" y1="6.5" y2="8"><stop stop-color="#A555FF"></stop><stop offset=".5" stop-color="#DE67FF"></stop><stop offset="1" stop-color="#E581FF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-3-_R_0_" x1="1" x2="6" y1="12" y2="16"><stop stop-color="#6C48FF"></stop><stop offset=".309" stop-color="#AA5AFF"></stop><stop offset="1" stop-color="#5145FF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-4-_R_0_" x1="19" x2="21" y1="11.5" y2="16.5"><stop stop-color="#CA3EFF"></stop><stop offset=".5" stop-color="#AB5CFF"></stop><stop offset="1" stop-color="#5042FF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-5-_R_0_" x1="6" x2="11" y1="20.5" y2="19"><stop stop-color="#5041FF"></stop><stop offset=".26" stop-color="#734FFF"></stop><stop offset=".75" stop-color="#6A4CFF"></stop><stop offset="1" stop-color="#483FFF"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-meta-ai-6-_R_0_" x1="12" x2="18.5" y1="17.5" y2="21.5"><stop stop-color="#7B51FF"></stop><stop offset=".475" stop-color="#6049FF"></stop><stop offset="1" stop-color="#8466FF"></stop></linearGradient></defs></svg>', "combined": '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="8" width="8" height="8" rx="2"/><path d="M10 3v5M14 3v5M10 16v5M14 16v5M3 10h5M3 14h5M16 10h5M16 14h5"/><circle cx="12" cy="12" r="1.5"/></svg>', "road": '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="14" cy="5" r="2"/><circle cx="14" cy="12" r="2"/><path d="M18 18h3M20 16v4"/></svg>' };
  DG_PROVIDER_LOGOS.counting = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M8 6h8M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2"/></svg>';
  DG_PROVIDER_LOGOS.parity = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><circle cx="18" cy="6" r="3" fill="currentColor"/><circle cx="6" cy="18" r="3" fill="currentColor"/><path d="M10 12h4"/></svg>';

  // lib/dg-provider-menu.ts
  function installDgProviderMenu(shadow, options) {
    const select = shadow.getElementById("provider");
    const trigger = shadow.getElementById("provider-trigger");
    const menu = shadow.getElementById("provider-menu");
    const currentLogo = shadow.getElementById("provider-selected-logo");
    const currentName = shadow.getElementById("provider-selected-name");
    const mainLogo = shadow.getElementById("main-strategy-logo");
    let last = "";
    const buttons = [];
    function logo(key, prefix) {
      return (DG_PROVIDER_LOGOS[key] ?? DG_PROVIDER_LOGOS.road).replace(/id="([^"]+)"/g, `id="${prefix}-$1"`).replace(/url\(#([^\)]+)\)/g, `url(#${prefix}-$1)`);
    }
    function close() {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
    function sync() {
      const key = select.value;
      if (key === last) return;
      last = key;
      currentLogo.innerHTML = logo(key, "trigger");
      mainLogo.innerHTML = logo(key, "main");
      currentName.textContent = options.find((x) => x.key === key)?.label ?? key;
      for (const b of buttons) {
        const active = b.dataset.value === key;
        b.classList.toggle("selected", active);
        b.setAttribute("aria-selected", String(active));
      }
    }
    function open() {
      if (trigger.disabled) return;
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      const triggerBox = trigger.getBoundingClientRect();
      const surface = shadow.getElementById("settings-page").getBoundingClientRect();
      const scale = trigger.offsetHeight ? triggerBox.height / trigger.offsetHeight : 1;
      const below = Math.max(0, (surface.bottom - triggerBox.bottom) / Math.max(0.2, scale) - 10);
      const above = Math.max(0, (triggerBox.top - surface.top) / Math.max(0.2, scale) - 10);
      const up = below < 252 && above > below;
      menu.style.top = up ? "auto" : "46px";
      menu.style.bottom = up ? "46px" : "auto";
      menu.style.maxHeight = Math.min(260, Math.max(84, up ? above : below)) + "px";
      menu.style.overflowY = "auto";
    }
    trigger.onclick = () => {
      sync();
      if (menu.hidden) open();
      else close();
    };
    trigger.onkeydown = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        open();
        (buttons.find((b) => b.dataset.value === select.value) ?? buttons[0]).focus();
      }
    };
    for (const option of options) {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.value = option.key;
      b.className = "provider-option";
      b.setAttribute("role", "option");
      b.setAttribute("aria-label", option.label);
      const mark = document.createElement("span");
      mark.className = "provider-logo";
      mark.setAttribute("aria-hidden", "true");
      mark.innerHTML = logo(option.key, "option-" + option.key);
      const label = document.createElement("span");
      label.textContent = option.label;
      const check2 = document.createElement("span");
      check2.className = "provider-check";
      check2.textContent = "\u2713";
      check2.setAttribute("aria-hidden", "true");
      b.append(mark, label, check2);
      b.onclick = () => {
        select.value = option.key;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        sync();
        close();
        trigger.focus();
      };
      b.onkeydown = (e) => {
        const index = buttons.indexOf(b);
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          buttons[(index + (e.key === "ArrowDown" ? 1 : buttons.length - 1)) % buttons.length].focus();
        }
        if (e.key === "Home" || e.key === "End") {
          e.preventDefault();
          buttons[e.key === "Home" ? 0 : buttons.length - 1].focus();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          close();
          trigger.focus();
        }
      };
      buttons.push(b);
      menu.append(b);
    }
    function outside(e) {
      if (!e.target?.closest(".provider-picker")) close();
    }
    function escape(e) {
      if (e.key === "Escape") close();
    }
    shadow.addEventListener("pointerdown", outside);
    shadow.addEventListener("keydown", escape);
    select.addEventListener("change", sync);
    sync();
    return { sync, close, cleanup: () => {
      shadow.removeEventListener("pointerdown", outside);
      shadow.removeEventListener("keydown", escape);
      select.removeEventListener("change", sync);
      trigger.onclick = trigger.onkeydown = null;
      for (const b of buttons) b.onclick = b.onkeydown = null;
    } };
  }

  // lib/dg-official-turnover.ts
  var DG_OFFICIAL_REFRESH_MS = 3e4;
  var DG_OFFICIAL_TIMEOUT_MS = 3e4;
  var EMPTY_STATUS = "\u5F85\u540C\u6B65\u5B98\u65B9\u5831\u8868";
  var SCOPE = "DG \u5B98\u65B9\u6709\u6548\u984D\uFF08dList[1]\uFF09";
  var EVENT_RECEIVED_SUCCESS = "RECEIVED_SUCCESS";
  function taipeiDay(now = Date.now()) {
    return new Date(now + 8 * 60 * 60 * 1e3).toISOString().slice(0, 10);
  }
  function rangeFor(period, day) {
    return period === "today" ? `${day}\uFF08DG \u5B98\u65B9\u4ECA\u65E5\uFF0CtimeSpan=1\uFF09` : "DG \u5B98\u65B9\u8FD17\u65E5\uFF08timeSpan=7\uFF1B\u4EE5\u5E73\u53F0\u5B9A\u7FA9\u70BA\u6E96\uFF09";
  }
  function emptyValue(period, day, status = EMPTY_STATUS) {
    return { value: null, status, updatedAt: null, range: rangeFor(period, day), scope: SCOPE };
  }
  function isObject2(value) {
    return !!value && typeof value === "object";
  }
  function numberOrNull(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    return value;
  }
  function zeroOrMissing(value) {
    return value === void 0 || value === null || value === "" || value === 0 || value === "0";
  }
  function accountIdentity(account, objectIds, nextObjectId) {
    if (account === null || account === void 0) return "none";
    if (typeof account === "string" || typeof account === "number" || typeof account === "boolean") {
      return `${typeof account}:${String(account)}`;
    }
    if (!isObject2(account)) return typeof account;
    for (const key of ["id", "accountId", "account", "username", "userName", "uid", "playerId", "memberId"]) {
      const value = account[key];
      if (typeof value === "string" || typeof value === "number") return `${key}:${String(value)}`;
    }
    const object2 = account;
    let id = objectIds.get(object2);
    if (id === void 0) {
      id = nextObjectId();
      objectIds.set(object2, id);
    }
    return `object:${id}`;
  }
  function candidatePlayerInfo(value) {
    if (!isObject2(value)) return null;
    const direct = value;
    if (direct.socketMan && typeof direct.socketMan.sendData === "function") return direct;
    const playerInfo = value.playerInfo;
    if (isObject2(playerInfo)) {
      const player = playerInfo;
      if (player.socketMan && typeof player.socketMan.sendData === "function") return player;
    }
    return null;
  }
  function findRuntime(W) {
    if (!isObject2(W)) return null;
    const laya = isObject2(W.Laya) ? W.Laya : null;
    const stage = laya && laya.stage;
    const roots = [];
    if (stage) roots.push(stage);
    roots.push(W);
    const seen = /* @__PURE__ */ new Set();
    let inspected = 0;
    while (roots.length && inspected++ < 2e3) {
      const node = roots.shift();
      if (!isObject2(node)) continue;
      if (seen.has(node)) continue;
      seen.add(node);
      const playerInfo = candidatePlayerInfo(node);
      if (playerInfo?.socketMan && typeof playerInfo.socketMan.sendData === "function") {
        return { playerInfo, socket: playerInfo.socketMan };
      }
      const count = numberOrNull(node.numChildren);
      if (count !== null && count >= 0 && typeof node.getChildAt === "function") {
        for (let i = 0; i < Math.min(count, 500); i++) {
          try {
            roots.push(node.getChildAt(i));
          } catch {
          }
        }
      }
      const children = node._children;
      if (Array.isArray(children)) roots.push(...children.slice(0, 500));
    }
    return null;
  }
  function readRequestBinding(bean, ownRequests, transportEpoch) {
    if (!isObject2(bean) || Number(bean.cmd) !== 13) return null;
    const list = Array.isArray(bean.list) ? bean.list : [];
    const type = Number.isFinite(Number(bean.type)) ? Number(bean.type) : null;
    const span = typeof bean.object === "string" || typeof bean.object === "number" ? String(bean.object) : null;
    const unfilteredFirstPage = type === 1 && (span === "1" || span === "7") && list.length === 4 && list[0] === "" && list[1] === "" && String(list[2]) === "12" && String(list[3]) === "1" && zeroOrMissing(bean.lobbyId) && zeroOrMissing(bean.tableId);
    return { own: ownRequests.get(bean) ?? null, type, span, unfilteredFirstPage, transportEpoch };
  }
  function parseReportObject(raw) {
    if (typeof raw === "string") {
      if (!raw.trim()) return null;
      try {
        const parsed = JSON.parse(raw);
        return isObject2(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
    return isObject2(raw) ? raw : null;
  }
  function officialValidAmount(raw) {
    if (typeof raw !== "number" && typeof raw !== "string") return null;
    if (typeof raw === "string" && !raw.trim()) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER / 100 ? value : null;
  }
  function responseLooksLikeUnfilteredBetReport(bean, binding) {
    if (Number(bean.cmd) !== 13 || Number(bean.type) !== 1 || binding.type !== 1 || !binding.unfilteredFirstPage) return false;
    if (!zeroOrMissing(bean.lobbyId) || !zeroOrMissing(bean.tableId)) return false;
    if (Array.isArray(bean.list)) {
      const list = bean.list;
      if (list.length && (list.length !== 4 || list[0] !== "" || list[1] !== "" || String(list[2]) !== "12" || String(list[3]) !== "1")) return false;
    }
    return true;
  }
  function parseOfficialReply(bean) {
    if (bean.codeId === null || bean.codeId === void 0 || bean.codeId === "" || Number(bean.codeId) !== 0) return null;
    const report = parseReportObject(bean.object);
    if (!report || !Array.isArray(report.records)) return null;
    for (const key of ["pageNow", "pageCount", "pageSize", "rowCount"]) {
      const value = Number(report[key]);
      if (!Number.isFinite(value) || value < 0) return null;
    }
    if (!Array.isArray(bean.dList) || bean.dList.length !== 3) return null;
    return officialValidAmount(bean.dList[1]);
  }
  function createDgOfficialTurnover(W, getAccount, canRefresh = () => true) {
    let disposed = false;
    let objectId = 0;
    const objectIds = /* @__PURE__ */ new WeakMap();
    const ownRequests = /* @__PURE__ */ new WeakMap();
    let requestId = 0;
    let currentDay = taipeiDay();
    let currentAccount = safeAccountIdentity();
    let today = emptyValue("today", currentDay);
    let week = emptyValue("week", currentDay);
    let socket = null;
    let originalSend = null;
    let sendObserver = null;
    let listenerAttached = false;
    let listenerMode = null;
    const listenerOwner = {};
    let socketListener = null;
    let transportEpoch = 0;
    let nativeTransport = void 0;
    let closedObserved = false;
    let connectionListeners = [];
    const bindings = [];
    let pending = null;
    let remaining = [];
    let timeout = null;
    let refreshTimer = null;
    let refreshQueued = false;
    let lastCycleAt = 0;
    let reconciliationRequired = false;
    const interval = setInterval(() => refresh(false), 1e3);
    function safeAccountIdentity() {
      let account = null;
      try {
        account = getAccount();
      } catch {
        return "unavailable";
      }
      return accountIdentity(account, objectIds, () => ++objectId);
    }
    function update(period, patch) {
      const previous = period === "today" ? today : week;
      const next = { ...previous, ...patch, range: rangeFor(period, currentDay), scope: SCOPE };
      if (period === "today") today = next;
      else week = next;
    }
    function clearTimeoutForPending() {
      if (timeout !== null) clearTimeout(timeout);
      timeout = null;
    }
    function scheduleRefresh() {
      if (disposed || refreshTimer !== null) return;
      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        refresh(false);
      }, 250);
    }
    function reconcileDrainedBindings() {
      if (pending || bindings.length) return;
      reconciliationRequired = false;
      lastCycleAt = 0;
      scheduleRefresh();
    }
    function markCurrentCancelled() {
      if (!pending) return;
      pending.cancelled = true;
      pending = null;
      clearTimeoutForPending();
    }
    function resetValues(status = EMPTY_STATUS) {
      markCurrentCancelled();
      remaining = [];
      refreshQueued = false;
      today = emptyValue("today", currentDay, status);
      week = emptyValue("week", currentDay, status);
    }
    function resetTransport(status) {
      transportEpoch++;
      resetValues(status);
      bindings.length = 0;
      reconciliationRequired = false;
      lastCycleAt = 0;
    }
    function refreshTransport(runtime) {
      if (socket && (socket !== runtime.socket || nativeTransport !== runtime.socket.socket)) {
        const distinctNative = !!nativeTransport && !!runtime.socket.socket && nativeTransport !== runtime.socket.socket;
        const distinctEmitter = socket !== runtime.socket && !nativeTransport && !runtime.socket.socket;
        if (distinctNative || distinctEmitter) resetTransport("DG\u5B98\u65B9\u9023\u7DDA\u5DF2\u66F4\u65B0\uFF0C\u91CD\u65B0\u540C\u6B65\u4E2D");
        detachSocket();
        closedObserved = false;
      }
      return attach(runtime);
    }
    function ensureFreshIdentity() {
      const day = taipeiDay();
      const account = safeAccountIdentity();
      if (day === currentDay && account === currentAccount) return;
      currentDay = day;
      currentAccount = account;
      resetValues();
      reconciliationRequired = false;
    }
    function detachSocket() {
      if (!socket) return;
      if (listenerAttached && socketListener && typeof socket.off === "function") {
        try {
          if (listenerMode === "emitter") socket.off(EVENT_RECEIVED_SUCCESS, socketListener);
          else socket.off(EVENT_RECEIVED_SUCCESS, listenerOwner, socketListener);
        } catch {
        }
        for (const entry of connectionListeners) {
          try {
            if (listenerMode === "emitter") socket.off(entry.event, entry.listener);
            else socket.off(entry.event, listenerOwner, entry.listener);
          } catch {
          }
        }
      }
      if (sendObserver && socket.sendData === sendObserver && originalSend) socket.sendData = originalSend;
      listenerAttached = false;
      listenerMode = null;
      socketListener = null;
      connectionListeners = [];
      nativeTransport = void 0;
      originalSend = null;
      sendObserver = null;
      socket = null;
    }
    function attach(runtime) {
      if (socket === runtime.socket && sendObserver && listenerAttached) return true;
      detachSocket();
      if (typeof runtime.socket.sendData !== "function" || typeof runtime.socket.on !== "function" || typeof runtime.socket.off !== "function") return false;
      socket = runtime.socket;
      const previousSend = runtime.socket.sendData;
      originalSend = previousSend;
      const observerEpoch = transportEpoch;
      sendObserver = function observedSend(bean) {
        if (!disposed && !closedObserved && socket === runtime.socket && observerEpoch === transportEpoch) observeOutgoing(bean);
        return previousSend.call(this, bean);
      };
      runtime.socket.sendData = sendObserver;
      const activeSocket = runtime.socket;
      const listenerEpoch = transportEpoch;
      nativeTransport = runtime.socket.socket;
      socketListener = (bean) => {
        if (!disposed && !closedObserved && socket === activeSocket && listenerEpoch === transportEpoch) receivedHandler(bean);
      };
      try {
        runtime.socket.on(EVENT_RECEIVED_SUCCESS, listenerOwner, socketListener);
        listenerMode = "laya";
        listenerAttached = true;
      } catch {
        try {
          runtime.socket.on(EVENT_RECEIVED_SUCCESS, socketListener);
          listenerMode = "emitter";
          listenerAttached = true;
        } catch {
          if (runtime.socket.sendData === sendObserver) runtime.socket.sendData = originalSend;
          socket = null;
          socketListener = null;
          originalSend = null;
          sendObserver = null;
          return false;
        }
      }
      const connectionEnded = () => {
        if (disposed || socket !== activeSocket || closedObserved || listenerEpoch !== transportEpoch) return;
        closedObserved = true;
        resetTransport("DG\u5B98\u65B9\u9023\u7DDA\u4E2D\u65B7\uFF0C\u7B49\u5F85\u65B0\u9023\u7DDA\u540C\u6B65");
      };
      const connectionFailed = () => {
        if (activeSocket.socket?.connected === false) connectionEnded();
      };
      const connectionOpened = () => {
        if (disposed || socket !== activeSocket || !closedObserved || activeSocket.socket?.connected === false) return;
        closedObserved = false;
        detachSocket();
        if (attach(runtime)) scheduleRefresh();
      };
      for (const entry of [
        { event: "CONNECT_CLOSED", listener: connectionEnded },
        { event: "CONNECT_FAILED", listener: connectionFailed },
        { event: "CONNECT_SUCCESS", listener: connectionOpened }
      ]) {
        try {
          if (listenerMode === "emitter") activeSocket.on(entry.event, entry.listener);
          else activeSocket.on(entry.event, listenerOwner, entry.listener);
          connectionListeners.push(entry);
        } catch {
        }
      }
      return true;
    }
    function observeOutgoing(bean) {
      const binding = readRequestBinding(bean, ownRequests, transportEpoch);
      if (!binding) return;
      bindings.push(binding);
      if (!binding.own && pending) {
        resetValues("\u5B98\u65B9\u5831\u8868\u8ACB\u6C42\u91CD\u758A\uFF0C\u5F85\u540C\u6B65");
        reconciliationRequired = true;
        return;
      }
      if (bindings.length > 64) failClosed("\u5B98\u65B9\u5831\u8868\u8ACB\u6C42\u7121\u6CD5\u5C0D\u61C9\uFF0C\u5F85\u624B\u52D5\u540C\u6B65");
    }
    function finishPeriod(request, value, status) {
      if (pending?.id !== request.id) return;
      clearTimeoutForPending();
      pending = null;
      if (!request.cancelled && request.account === currentAccount && request.taipeiDay === currentDay) {
        update(request.period, { value, status, updatedAt: value === null ? null : Date.now() });
      }
      sendNext();
    }
    function failClosed(status) {
      clearTimeoutForPending();
      if (pending && !pending.cancelled && pending.account === currentAccount && pending.taipeiDay === currentDay) {
        update(pending.period, { value: null, status, updatedAt: null });
      }
      if (pending) pending.expired = true;
      pending = null;
      remaining = [];
      reconciliationRequired = true;
    }
    function receivedHandler(bean) {
      if (disposed || !isObject2(bean) || Number(bean.cmd) !== 13) return;
      const binding = bindings.shift();
      if (!binding) {
        if (pending) failClosed("\u5B98\u65B9\u5831\u8868\u56DE\u8986\u7121\u6CD5\u5C0D\u61C9\uFF0C\u5F85\u624B\u52D5\u540C\u6B65");
        return;
      }
      if (binding.transportEpoch !== transportEpoch) return;
      if (!binding.own) {
        if (reconciliationRequired) reconcileDrainedBindings();
        return;
      }
      const request = binding.own;
      if (request.transportEpoch !== transportEpoch || request.expired || request.cancelled || pending?.id !== request.id) {
        reconcileDrainedBindings();
        return;
      }
      if (!responseLooksLikeUnfilteredBetReport(bean, binding)) {
        failClosed("\u5B98\u65B9\u5831\u8868\u56DE\u8986\u4E0D\u7B26\uFF0C\u5F85\u624B\u52D5\u540C\u6B65");
        return;
      }
      const amount = parseOfficialReply(bean);
      finishPeriod(request, amount, amount === null ? "\u5B98\u65B9\u5831\u8868\u56DE\u8986\u7121\u6548" : "\u5DF2\u540C\u6B65\u5B98\u65B9\u5831\u8868");
    }
    function requestPeriod(period) {
      ensureFreshIdentity();
      if (disposed) return;
      const runtime = findRuntime(W);
      if (!runtime || !refreshTransport(runtime)) {
        update(period, { value: null, status: "\u5F85DG\u5B98\u65B9\u5831\u8868\u5C31\u7DD2", updatedAt: null });
        remaining = [];
        lastCycleAt = 0;
        return;
      }
      let suppliedAccount;
      try {
        suppliedAccount = getAccount();
      } catch {
        suppliedAccount = null;
      }
      if (isObject2(suppliedAccount) && suppliedAccount !== runtime.playerInfo) {
        resetValues("DG\u5DE5\u4F5C\u968E\u6BB5\u5DF2\u8B8A\u66F4\uFF0C\u5F85\u91CD\u65B0\u5B89\u88DD\u6838\u5C0D");
        reconciliationRequired = true;
        return;
      }
      if (runtime.socket.socket?.connected === false) {
        update(period, { value: null, status: "\u5F85DG\u5B98\u65B9\u5831\u8868\u9023\u7DDA", updatedAt: null });
        remaining = [];
        lastCycleAt = 0;
        return;
      }
      if (runtime.playerInfo.token === void 0 || runtime.playerInfo.token === null || runtime.playerInfo.token === "") {
        update(period, { value: null, status: "\u5F85DG\u5B98\u65B9\u5E33\u865F\u5C31\u7DD2", updatedAt: null });
        remaining = [];
        lastCycleAt = 0;
        return;
      }
      const request = {
        id: ++requestId,
        period,
        account: currentAccount,
        taipeiDay: currentDay,
        sentAt: Date.now(),
        expired: false,
        cancelled: false,
        transportEpoch
      };
      const bean = { cmd: 13, type: 1, token: runtime.playerInfo.token, object: period === "today" ? "1" : "7", list: ["", "", "12", "1"] };
      ownRequests.set(bean, request);
      pending = request;
      update(period, { status: "\u8B80\u53D6DG\u5B98\u65B9\u5831\u8868\u4E2D" });
      try {
        runtime.socket.sendData(bean);
      } catch {
        if (pending?.id === request.id) finishPeriod(request, null, "DG\u5B98\u65B9\u5831\u8868\u8ACB\u6C42\u5931\u6557");
        return;
      }
      if (!bindings.some((binding) => binding.own?.id === request.id)) {
        failClosed("DG\u5B98\u65B9\u5831\u8868\u8ACB\u6C42\u7121\u6CD5\u9A57\u8B49\uFF0C\u5F85\u624B\u52D5\u540C\u6B65");
        return;
      }
      timeout = setTimeout(() => {
        if (disposed || pending?.id !== request.id) return;
        request.expired = true;
        failClosed("DG\u5B98\u65B9\u5831\u8868\u903E\u6642\uFF0C\u7B49\u5F85\u524D\u6B21\u56DE\u8986\u5F8C\u81EA\u52D5\u91CD\u8A66\uFF1B\u53EF\u6838\u5C0D\u7D50\u7B97\u5F8C\u91CD\u9023");
      }, DG_OFFICIAL_TIMEOUT_MS);
    }
    function sendNext() {
      if (disposed || pending || reconciliationRequired) return;
      if (!canRefresh()) return;
      const period = remaining.shift();
      if (period) requestPeriod(period);
      else if (refreshQueued) scheduleRefresh();
    }
    function refresh(force = false) {
      if (disposed) return;
      ensureFreshIdentity();
      if (force) refreshQueued = true;
      const runtime = findRuntime(W);
      if (runtime) refreshTransport(runtime);
      if (!canRefresh()) return;
      if (closedObserved) return;
      if (pending) return;
      if (reconciliationRequired || bindings.length) return;
      if (remaining.length) {
        sendNext();
        return;
      }
      const now = Date.now();
      if (!refreshQueued && now - lastCycleAt < DG_OFFICIAL_REFRESH_MS) return;
      refreshQueued = false;
      lastCycleAt = now;
      remaining = ["today", "week"];
      sendNext();
    }
    function view() {
      ensureFreshIdentity();
      const result = { platform: "DG", today: { ...today }, week: { ...week } };
      if (pending && !pending.cancelled) {
        const elapsed = Math.max(0, Date.now() - pending.sentAt);
        if (elapsed >= 1e4) result[pending.period].status = `DG\u5B98\u65B9\u5831\u8868\u56DE\u61C9\u8F03\u6162\uFF0C\u5DF2\u7B49\u5F85${Math.floor(elapsed / 1e3)}\u79D2`;
      }
      return result;
    }
    function dispose() {
      if (disposed) return;
      disposed = true;
      clearInterval(interval);
      if (refreshTimer !== null) clearTimeout(refreshTimer);
      refreshTimer = null;
      refreshQueued = false;
      clearTimeoutForPending();
      markCurrentCancelled();
      remaining = [];
      detachSocket();
    }
    return { view, refresh, dispose };
  }

  // lib/dg-mobile-native.ts
  function isRecord(value) {
    return !!value && typeof value === "object";
  }
  function safeProperty(value, key) {
    try {
      return isRecord(value) ? value[key] : void 0;
    } catch {
      return void 0;
    }
  }
  function control(value) {
    return typeof value === "function" || isRecord(value) && typeof safeProperty(value, "event") === "function";
  }
  function getDgBetControls(card) {
    if (control(card?.betMan?.confirm) && control(card?.betMan?.cancel)) return { profile: "desktop", manager: card.betMan, confirm: card.betMan.confirm, cancel: card.betMan.cancel };
    if (control(card?.betBtnMan?.confirmBtn) && control(card?.betBtnMan?.cancelBtn)) return { profile: "mobile-v329", manager: card.betBtnMan, confirm: card.betBtnMan.confirmBtn, cancel: card.betBtnMan.cancelBtn };
    return null;
  }
  function isDgMultiLobbyCard(value) {
    if (!isRecord(value)) return false;
    const gameInfo = safeProperty(value, "gameInfo"), betBtn = safeProperty(value, "betBtn");
    const socketMan = safeProperty(safeProperty(value, "playerInfo"), "socketMan");
    return value.tableId !== void 0 && isRecord(gameInfo) && isRecord(betBtn) && betBtn.Banker !== void 0 && betBtn.Player !== void 0 && getDgBetControls(value) !== null && isRecord(safeProperty(value, "betMoneyTmp")) && isRecord(safeProperty(value, "betMoneyTrue")) && typeof safeProperty(value, "confirmBet") === "function" && isRecord(socketMan) && typeof socketMan.sendData === "function";
  }
  function dgBuilderSourceFingerprint(fn) {
    let source;
    try {
      source = Function.prototype.toString.call(fn).replace(/^function\s+/, "").replace(/\s+/g, "");
    } catch {
      return "";
    }
    let hash2 = 2166136261;
    for (let index = 0; index < source.length; index++) hash2 = Math.imul(hash2 ^ source.charCodeAt(index), 16777619);
    return `${source.length}:${(hash2 >>> 0).toString(16)}`;
  }
  function hasDgVerifiedMobilePacketBuilder(card) {
    if (!isDgMultiLobbyCard(card) || getDgBetControls(card)?.profile !== "mobile-v329") return false;
    return ["1517:2faa00b2", "1443:b3416a14"].includes(dgBuilderSourceFingerprint(card.confirmBet));
  }
  function hasDgVerifiedDirectPacketBuilder(card) {
    if (!isDgMultiLobbyCard(card)) return false;
    if (getDgBetControls(card)?.profile === "mobile-v329") return hasDgVerifiedMobilePacketBuilder(card);
    let source = "";
    try {
      source = Function.prototype.toString.call(card.confirmBet);
    } catch {
      return false;
    }
    return ["betMoneyTmp", "betMoneyTrue", "gameNo", "BET_CHIP", "encrypt", "demo"].every((marker) => source.includes(marker));
  }
  function dgNativeBetEnabled(card) {
    const controls = getDgBetControls(card);
    return controls?.profile === "mobile-v329" ? hasDgVerifiedMobilePacketBuilder(card) && controls.manager.betFlag === true : card?.betFlag === true;
  }
  function inspectDgMobileNativeSurface(W) {
    const win = W, width = Number(win?.innerWidth), height = Number(win?.innerHeight);
    const portrait = Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > width;
    const stage = win?.Laya?.stage;
    if (!isRecord(stage) || typeof safeProperty(stage, "getChildAt") !== "function") return { readiness: "waiting-stage", portrait, cardCount: 0, rejectedCardCount: 0 };
    const cards = readDgSceneNodes(stage).filter((node) => isDgMultiLobbyCard(node) && dgSceneNodeVisible(node));
    if (!cards.length) return { readiness: "waiting-multi-table", portrait, cardCount: 0, rejectedCardCount: 0 };
    const rejectedCardCount = cards.filter((card) => !hasDgVerifiedDirectPacketBuilder(card)).length;
    return { readiness: rejectedCardCount ? "unverified-packet-builder" : "compatible", portrait, cardCount: cards.length, rejectedCardCount };
  }

  // lib/dg-mobile-public-source.ts
  function exportDgMobileLoadedPublicScripts(documentLike) {
    const doc = documentLike;
    const base = typeof doc?.baseURI === "string" ? doc.baseURI : doc?.location?.href;
    if (typeof base !== "string" || !base) return { version: 1, status: "unavailable", scripts: [] };
    let baseUrl;
    try {
      baseUrl = new URL(base);
    } catch {
      return { version: 1, status: "unavailable", scripts: [] };
    }
    const scripts = [];
    const seen = /* @__PURE__ */ new Set();
    for (const script of Array.from(doc?.scripts ?? [])) {
      const raw = typeof script?.src === "string" ? script.src.trim() : "";
      if (!raw) continue;
      let source;
      try {
        source = new URL(raw, baseUrl);
      } catch {
        continue;
      }
      if (source.protocol !== "https:" && source.protocol !== "http:") continue;
      const url2 = source.origin + source.pathname;
      if (seen.has(url2)) continue;
      seen.add(url2);
      scripts.push({ url: url2, type: typeof script.type === "string" ? script.type : "" });
    }
    return { version: 1, status: "ready", scripts };
  }

  // lib/dg-console-entry.ts
  (() => {
    const previous = window.__DG_SINGLEPAGE__;
    if (previous?.dispose) previous.dispose();
    const L = window.Laya;
    if (!L?.stage?.getChildAt) {
      console.error("[DG] \u76EE\u524D\u4E0D\u662F\u8F09\u5165\u5B8C\u6210\u7684 DG Laya \u9801\u9762\u3002\u8ACB\u9078\u64C7 DG \u5206\u9801\uFF0FConsole \u57F7\u884C\u74B0\u5883\u3002");
      return;
    }
    const ledger = new DgBetLedger();
    const pokerTracker = createDgPokerTracker();
    const sessionTimer = createDgSessionTimer();
    const usageHistory = createDgUsageHistory();
    let running = false, busy = false, disposed = false, epoch = 0, once = false;
    let base = 100, scope = "global", provider = "combined", roomCount = "1", maxStake = 1e5, minSeconds = 6;
    let singleStaking = "martingale", userZoom = 1;
    let startMode = "fresh";
    let runEventId = "", settingsSyncState = "not-started";
    let activeSettings = null;
    let panelWidth = 280, panelHeight = 560, lastRenderedEvents = "";
    let riskLimits = { stopLoss: null, takeProfit: null };
    let riskApproved = false, riskTestOnce = false, riskReturnFocus = null;
    let mini = false, miniPreviousCompact = true;
    let manualSelection = false;
    let selected = /* @__PURE__ */ new Set(), status = "\u505C\u6B62\uFF1A\u5148\u8B80\u53D6 DG \u55AE\u9801\u591A\u684C\u8CC7\u6599";
    let socket = null, account = null;
    let walletPlayer = null;
    let nativeBetKey = "", originalSend = null, sendObserver = null;
    const owner = {}, logs = [], contexts = /* @__PURE__ */ new Map();
    let persistKey = "";
    let compact = true, reportPeriod = "today", reportPage = 0, reportTab = "bets";
    const tableWait = /* @__PURE__ */ new Map(), lastNotice = /* @__PURE__ */ new Map();
    const watchedRounds = /* @__PURE__ */ new Map();
    const usageReportableRuns = /* @__PURE__ */ new Set(), usageReportSequences = /* @__PURE__ */ new Map(), usageReportLastReports = /* @__PURE__ */ new Map(), usageReportLastSentAt = /* @__PURE__ */ new Map(), usageStopCodes = /* @__PURE__ */ new Map();
    const usageReportIntervalMs = 2e4;
    const money = (n) => n.toLocaleString("zh-TW");
    function persistUsage() {
      usageHistory.sync(ledger.state.bets);
      try {
        if (persistKey) localStorage.setItem(persistKey + ".usage.v1", JSON.stringify(usageHistory.snapshot()));
      } catch {
      }
    }
    function persistUsageCheckpoint() {
      if (!persistKey) return;
      const known = new Set(usageHistory.view().map((run) => run.id));
      const runs = [...usageReportableRuns].filter((id) => known.has(id)).map((runId) => ({ runId, nextSequence: usageReportSequences.get(runId) ?? 0, lastReport: usageReportLastReports.get(runId) ?? null, stopCode: usageStopCodes.get(runId) ?? null }));
      try {
        localStorage.setItem(persistKey + ".usage.v5.checkpoint", JSON.stringify({ version: 1, statementVersion: DG_RISK_STATEMENT.version, runs }));
      } catch {
      }
    }
    function markUsageReportable(runId) {
      usageReportableRuns.add(runId);
      usageReportSequences.set(runId, 0);
      persistUsageCheckpoint();
    }
    function restoreUsageCheckpoint() {
      usageReportableRuns.clear();
      usageReportSequences.clear();
      usageReportLastReports.clear();
      usageStopCodes.clear();
      if (!persistKey) return;
      try {
        const saved = JSON.parse(localStorage.getItem(persistKey + ".usage.v5.checkpoint") ?? "null");
        if (saved?.version !== 1 || saved?.statementVersion !== DG_RISK_STATEMENT.version || !Array.isArray(saved.runs)) return;
        const known = new Set(usageHistory.view().map((run) => run.id));
        for (const value of saved.runs) {
          const runId = typeof value?.runId === "string" ? value.runId : "";
          const parsed = dgUsageReportSchema.safeParse(value?.lastReport);
          const nextSequence = value?.nextSequence;
          if (!known.has(runId) || !parsed.success || parsed.data.runId !== runId || !Number.isSafeInteger(nextSequence) || nextSequence < parsed.data.sequence + 1) continue;
          usageReportableRuns.add(runId);
          usageReportSequences.set(runId, nextSequence);
          usageReportLastReports.set(runId, parsed.data);
          if (parsed.data.status === "stopped" && parsed.data.stopCode) usageStopCodes.set(runId, parsed.data.stopCode);
          if (value?.stopCode && ["manual", "time_limit", "stop_loss", "take_profit", "stake_cap", "other"].includes(value.stopCode)) usageStopCodes.set(runId, value.stopCode);
        }
      } catch {
      }
    }
    function usageStopCode(reason) {
      if (/已達設定|時間/.test(reason)) return "time_limit";
      if (/止損/.test(reason)) return "stop_loss";
      if (/止盈/.test(reason)) return "take_profit";
      if (/超過.*上限|上限.*超過/.test(reason)) return "stake_cap";
      if (/^已停止/.test(reason)) return "manual";
      return "other";
    }
    function reportUsage(runId, force = false, keepalive = false) {
      if (!usageReportableRuns.has(runId)) return;
      const at = Date.now(), last = usageReportLastSentAt.get(runId) ?? 0;
      if (!force && at - last < usageReportIntervalMs) return;
      const run = usageHistory.view().find((item) => item.id === runId);
      if (!run) return;
      const sequence = usageReportSequences.get(runId) ?? 0;
      const status2 = run.state === "stopped" ? "stopped" : run.state === "interrupted" ? "interrupted" : "active";
      const report = {
        version: 1,
        runId,
        settingsEventId: runId,
        sequence,
        status: status2,
        stopCode: status2 === "stopped" ? usageStopCodes.get(runId) ?? "other" : null,
        startedAt: run.createdAt,
        updatedAt: run.updatedAt,
        endedAt: status2 === "stopped" ? run.endedAt : null,
        elapsedMs: Math.floor(run.elapsedMs),
        durationMinutes: run.minutes,
        eventCounts: run.eventCounts,
        result: { settledPnl: run.pnl, settledCount: run.settledCount, wins: run.wins, losses: run.losses, pendingCount: run.pendingCount, uncertainCount: run.uncertainCount }
      };
      try {
        window.dispatchEvent(new CustomEvent(DG_USAGE_REPORT_EVENT, { detail: { report, keepalive } }));
        usageReportSequences.set(runId, sequence + 1);
        usageReportLastReports.set(runId, report);
        usageReportLastSentAt.set(runId, at);
        persistUsageCheckpoint();
      } catch {
      }
    }
    function reportUsageForBet(key) {
      for (const run of usageHistory.view()) if (usageReportableRuns.has(run.id) && Object.prototype.hasOwnProperty.call(run.bets, key)) reportUsage(run.id, true);
    }
    function finishUsage(stopCode = "other") {
      sessionTimer.stop();
      const finished = usageHistory.finish(sessionTimer.view().elapsedMs);
      persistUsage();
      if (finished) {
        usageStopCodes.set(finished, stopCode);
        persistUsageCheckpoint();
        reportUsage(finished, true);
      }
    }
    function persist() {
      if (persistKey) {
        window.__DG_LEDGER_STATE__ = ledger.state;
        window.__DG_LEDGER_PERSIST_KEY__ = persistKey;
      }
      persistUsage();
      try {
        if (persistKey) sessionStorage.setItem(persistKey, JSON.stringify(ledger.state));
      } catch {
      }
    }
    function log(text) {
      status = text;
      logs.unshift(`${(/* @__PURE__ */ new Date()).toLocaleTimeString("zh-TW", { hour12: false })} ${text}`);
      logs.length = Math.min(logs.length, 50);
      console.log("[DG]", text);
      render();
    }
    function stop(reason = "\u5DF2\u505C\u6B62\uFF1B\u5DF2\u9001\u51FA\u7684\u4E0B\u6CE8\u4ECD\u7B49\u5F85\u5E73\u53F0\u7D50\u7B97") {
      finishUsage(usageStopCode(reason));
      running = false;
      once = false;
      riskApproved = false;
      epoch++;
      q("risk-dialog").hidden = true;
      log(reason);
    }
    function stopIfTimeExpired() {
      if (!running || !sessionTimer.expired()) return false;
      stop(`\u5DF2\u9054\u8A2D\u5B9A ${sessionTimer.view().minutes} \u5206\u9418\uFF0C\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8\uFF1B\u5DF2\u63A5\u53D7\u6CE8\u55AE\u7E7C\u7E8C\u7B49\u5F85\u7D50\u7B97`);
      return true;
    }
    function userStatus(text) {
      let value = text.replace(/\b\d{10,}\b/g, "");
      for (const c of boards()) value = value.replaceAll(String(c.tableId) + "\uFF5C", (c.gameInfo.tableName || String(c.tableId)) + "\uFF5C");
      value = value.replace(/｜[^｜]*｜已直接傳送 cmd 6：[\s\S]*/, "\uFF1A\u5DF2\u9001\u51FA\uFF0C\u7B49\u5F85\u78BA\u8A8D");
      value = value.replace(/｜[^｜]*｜平台已接受下注｜/, "\uFF1A\u4E0B\u6CE8\u6210\u529F ");
      value = value.replace(/｜[^｜]*｜結算 /, "\uFF1A\u7D50\u7B97 ");
      if (/已接上 DG 原生/.test(value)) return "\u5DF2\u9023\u7DDA\uFF0C\u5C1A\u672A\u958B\u59CB";
      if (/^找到 /.test(value)) {
        const wanted = value.match(/要求 (\d+) 桌/);
        return `\u5DF2\u9078 ${selected.size} \u684C${wanted ? `\uFF08\u8981\u6C42 ${wanted[1]} \u684C\uFF0C\u7B49\u5F85\u88DC\u8DB3\uFF09` : "\uFF0C\u53EF\u8A2D\u5B9A\u5F8C\u958B\u59CB"}`;
      }
      if (/^同時 \d+ 桌啟動/.test(value)) return `${selected.size} \u684C\u57F7\u884C\u4E2D\uFF0C\u5404\u684C\u7368\u7ACB\u4E0B\u6CE8`;
      if (/^測試一筆完整/.test(value)) return "\u6E2C\u8A66\u4E00\u7B46\uFF1A\u7B49\u5F85\u4E0B\u6CE8\u78BA\u8A8D";
      if (/金額 .* 低於平台最低/.test(value)) return value.replace(/金額 (\d+) 低於平台最低 (\d+)[\s\S]*/, "\u91D1\u984D $1 \u4F4E\u65BC\u6700\u4F4E $2\uFF0C\u672A\u4E0B\u6CE8");
      if (/莊閒限額尚未同步/.test(value)) return value.split("\uFF5C")[0] + "\uFF1A\u7B49\u5F85\u4E0B\u6CE8\u9650\u984D";
      return value.replace("DG ", "").replace("cmd 6", "\u4E0B\u6CE8").replace("\u5C01\u5305", "\u9023\u7DDA\u8CC7\u6599").replace("global", "\u5171\u7528\u5E33\u672C").replace("\u5DE5\u4F5C\u968E\u6BB5", "\u9023\u7DDA").replace("\u4FDD\u7559\u672C\u5C40\u9396\u5B9A\uFF0C\u4E0D\u91CD\u9001", "\u8ACB\u6838\u5C0D\u4E0B\u6CE8\u7D00\u9304\uFF0C\u4E0D\u91CD\u9001");
    }
    function waitTable(card, reason) {
      const id = String(card.tableId);
      tableWait.set(id, reason);
      const signature = String(card.gameInfo?.gameNo) + "|" + reason;
      if (lastNotice.get(id) !== signature) {
        lastNotice.set(id, signature);
        log(`${card.gameInfo?.tableName || id}\uFF5C${reason}`);
      }
    }
    function currentRoundState(card) {
      const id = String(card.tableId), gameNo = String(card.gameInfo?.gameNo ?? "");
      const bet = ledger.state.bets.find((b) => b.key === `${id}:${gameNo}`);
      if (bet) return { label: bet.state === "accepted" ? "\u5DF2\u63A5\u53D7 \xB7 \u5F85\u7D50\u7B97" : bet.state === "settled" ? "\u5DF2\u4E0B\u6CE8 \xB7 \u5DF2\u7D50\u7B97" : bet.state === "rejected" ? "\u4E0B\u6CE8\u88AB\u62D2\u7D55" : bet.state === "uncertain" ? "\u56DE\u8986\u672A\u78BA\u5B9A" : bet.state === "aborted" ? "\u672A\u9001\u51FA" : "\u5DF2\u9001\u51FA \xB7 \u5F85\u78BA\u8A8D", ok: bet.state === "accepted" || bet.state === "settled" };
      if (ledger.pending().some((b) => b.tableId === id)) return { label: "\u4E0A\u4E00\u7B46\u5F85\u7D50\u7B97", ok: false };
      const limit = checkDgAmount(card, stakeAmount(id));
      if (!limit.ok) return { label: userStatus(limit.reason), ok: false };
      if (Number(card.gameInfo?.stateId) !== 1) return { label: "\u672C\u5C40\u5DF2\u5C01\u76E4\uFF0F\u672A\u958B\u653E", ok: false };
      if (remaining(card) < minSeconds) return { label: "\u5269\u9918\u6642\u9593\u4E0D\u8DB3\uFF0C\u672A\u4E0B\u6CE8", ok: false };
      if (!dgNativeBetEnabled(card)) return { label: "\u539F\u751F\u78BA\u8A8D\u5C1A\u5728\u9396\u5B9A\uFF0C\u672A\u4E0B\u6CE8", ok: false };
      const decision = strategyFor(card);
      if (!decision.side) return { label: decision.reason || "\u7B56\u7565\u8CC7\u6599\u4E0D\u8DB3\uFF0C\u672A\u4E0B\u6CE8", ok: false };
      return { label: tableWait.get(id) ? userStatus(tableWait.get(id)) : running ? "\u6E96\u5099\u9001\u51FA" : "\u5DF2\u505C\u6B62", ok: false };
    }
    function trackRounds(cards) {
      if (!running) return;
      for (const c of cards.filter((c2) => selected.has(String(c2.tableId)))) {
        let finish2 = function() {
          if (!watched || watched.closed) return;
          watched.closed = true;
          const bet = ledger.state.bets.find((b) => b.key === `${id}:${watched.gameNo}`);
          if (!bet || bet.state === "aborted" || bet.state === "rejected") log(`${c.gameInfo.tableName || id} \u7B2C${watched.round}\u5C40\u672A\u4E0B\u5230\uFF1A${watched.reason}`);
        };
        var finish = finish2;
        const id = String(c.tableId), gameNo = String(c.gameInfo?.gameNo ?? "");
        if (!gameNo) continue;
        let watched = watchedRounds.get(id);
        if (watched && watched.gameNo !== gameNo) {
          finish2();
          watched = void 0;
          watchedRounds.delete(id);
          tableWait.delete(id);
        }
        if (!watched && Number(c.gameInfo?.stateId) === 1) {
          watched = { gameNo, round: String(c.gameInfo.playId ?? "\u2014"), closed: false, reason: "" };
          watchedRounds.set(id, watched);
        }
        if (watched && watched.gameNo === gameNo) {
          const state = currentRoundState(c);
          if (Number(c.gameInfo?.stateId) === 1) watched.reason = state.label;
          else finish2();
        }
      }
    }
    const visible = dgSceneNodeVisible;
    function nodes() {
      return readDgSceneNodes(L.stage);
    }
    function boards(all = nodes()) {
      const unique = /* @__PURE__ */ new Map();
      for (const n of all) {
        if (isDgMultiLobbyCard(n) && visible(n) && (getDgBetControls(n)?.profile !== "mobile-v329" || hasDgVerifiedMobilePacketBuilder(n))) {
          const k = String(n.tableId);
          if (!unique.has(k)) unique.set(k, n);
        }
      }
      return [...unique.values()].sort((a, b) => Number(a.tableId) - Number(b.tableId));
    }
    function remaining(n) {
      const info = n.gameInfo;
      let result = Number(info.countDown);
      if (info.starTime != null && Number.isFinite(Number(info.starTime))) {
        const now = L.Browser?.now?.() ?? Date.now();
        result -= Math.max(0, (now - Number(info.starTime)) / 1e3);
      }
      const text = String(n.countDownMan?.countDown ?? n.countDownMan?.text ?? "").trim();
      if (/^\d+$/.test(text)) result = Math.min(result, Number(text));
      return Number.isFinite(result) ? Math.max(0, result) : 0;
    }
    function ready(n) {
      return visible(n) && Number(n.gameInfo?.stateId) === 1 && remaining(n) >= minSeconds && dgNativeBetEnabled(n) && visible(n.betBtn?.Banker) && visible(n.betBtn?.Player) && n.betBtn.Banker.mouseEnabled !== false && n.betBtn.Player.mouseEnabled !== false;
    }
    function roads(n) {
      if (!Array.isArray(n.gameInfo.roadArray)) return [];
      return [...n.gameInfo.roadArray].reverse().map((r) => {
        const x = r?.road;
        const v = Number(Array.isArray(x) ? x[0] : typeof x === "string" ? x.split(",")[0] : NaN);
        return v >= 1 && v <= 4 ? "\u838A" : v >= 5 && v <= 8 ? "\u9592" : v >= 9 && v <= 12 ? "\u548C" : null;
      }).filter((x) => x !== null);
    }
    function strategyFor(card, key = provider) {
      if (key === "counting" || key === "parity") {
        const result = pokerTracker.decision(card, key);
        return result.ok ? result : { confidence: 0, reason: result.reason };
      }
      const results = roads(card);
      if (results.filter((x) => x !== "\u548C").length < 3) return { confidence: 0, reason: "\u7B49\u5F85\u81F3\u5C113\u7B46\u838A\u9592\u724C\u8DEF" };
      return localProviderDecision(key, results);
    }
    function sameSession(b) {
      return b.playerInfo === account && b.playerInfo?.socketMan === socket && socket?.socket?.connected !== false;
    }
    function attach(all) {
      const p = findDgScenePlayer(all);
      walletPlayer = p;
      if (!p?.socketMan?.on || !p?.socketMan?.off) return;
      if (account && p !== account) {
        stop("DG \u5DE5\u4F5C\u968E\u6BB5\u6539\u8B8A\uFF0C\u8ACB\u91CD\u65B0\u8F09\u5165\u8173\u672C");
        return;
      }
      if (socket === p.socketMan) return;
      socket?.off("RECEIVED_SUCCESS", owner, onMessage);
      socket = p.socketMan;
      account = p;
      const ident = String(p.mid ?? p.playerName ?? "session") + "|" + String(p.currency ?? "");
      let h = 2166136261;
      for (const ch of ident) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
      persistKey = `dg.singlepage.ledger.v1.${h >>> 0}`;
      let savedLedger = null;
      try {
        const saved = JSON.parse(sessionStorage.getItem(persistKey) ?? "null");
        if (saved?.version === 1) savedLedger = saved;
      } catch {
      }
      const scopedMemory = window.__DG_LEDGER_PERSIST_KEY__ === persistKey ? window.__DG_LEDGER_STATE__ : null;
      ledger.state = new DgBetLedger(savedLedger ?? scopedMemory).state;
      try {
        usageHistory.load(JSON.parse(localStorage.getItem(persistKey + ".usage.v1") ?? "null"));
      } catch {
        usageHistory.load(null);
      }
      restoreUsageCheckpoint();
      ledger.state.roundStartedAt ??= mountedAt;
      migrateSingleChain();
      for (const bet of ledger.pending()) if (bet.state === "submitted" || bet.state === "reserved") bet.state = "uncertain";
      originalSend = socket.sendData;
      sendObserver = function(msg, ...args) {
        if (Number(msg?.cmd) === 6) {
          const key = `${msg.tableId}:${msg.gameNo}`;
          const bet = ledger.pending().find((b) => b.key === key);
          if (bet && nativeBetKey !== key) {
            bet.attributionUncertain = true;
            bet.state = "uncertain";
            persist();
            stop("\u5075\u6E2C\u540C\u5C40\u984D\u5916\u4E0B\u6CE8\uFF1B\u672C\u7B46\u640D\u76CA\u4E0D\u80FD\u55AE\u7368\u6838\u5C0D\uFF0C\u505C\u6B62\u914D\u6CE8\u63A8\u9032");
          }
        }
        return originalSend.call(this, msg, ...args);
      };
      socket.sendData = sendObserver;
      socket.on("RECEIVED_SUCCESS", owner, onMessage);
      persist();
      log("\u5DF2\u63A5\u4E0A DG \u539F\u751F\u56DE\u8986\uFF0F\u7D50\u7B97\u4E8B\u4EF6\uFF1B\u672A\u57F7\u884C\u4E0B\u6CE8");
    }
    function onMessage(msg) {
      if (disposed) return;
      queueMicrotask(() => {
        if (!disposed) pokerTracker.observe(boards());
      });
      const receipt = ledger.receipt(msg);
      if (receipt) {
        persist();
        log(`${receipt.bet.tableId}\uFF5C${receipt.bet.gameNo}\uFF5C${receipt.accepted ? "\u5E73\u53F0\u5DF2\u63A5\u53D7\u4E0B\u6CE8" : "\u5E73\u53F0\u62D2\u7D55\u6216\u91D1\u984D\u4E0D\u7B26\uFF0C\u672A\u6A19\u793A\u6210\u529F"}\uFF5C${receipt.bet.side} ${money(receipt.bet.amount)}`);
        reportUsageForBet(receipt.bet.key);
        if (!receipt.accepted) stop("\u672C\u7B46\u4E0B\u6CE8\u672A\u78BA\u8A8D\u63A5\u53D7\uFF0C\u5DF2\u505C\u6B62\uFF1B\u4E0D\u81EA\u52D5\u91CD\u9001");
        if (once) {
          finishUsage();
          running = false;
          once = false;
        }
      }
      const settled = ledger.settle(msg);
      if (settled) {
        if (settled.bet.scope === "table" && settled.bet.staking !== "flat" && roomCount === "1") ledger.state.levels.global = settled.nextLevel;
        persist();
        log(`${settled.bet.tableId}\uFF5C${settled.bet.gameNo}\uFF5C\u7D50\u7B97 ${settled.pnl > 0 ? "+" : ""}${money(settled.pnl)}\uFF5C${settled.bet.staking === "flat" ? "\u5E73\u6CE8\uFF1A\u91D1\u984D\u56FA\u5B9A" : settled.pnl > 0 ? "\u8D0F\uFF1A\u91CD\u7F6E" : settled.pnl < 0 ? "\u8F38\uFF1A\u5347\u968E" : "\u548C\uFF0F\u9000\u6CE8\uFF1A\u7DAD\u6301"}\uFF5C\u4E0B\u4E00\u6CE8 ${money(stakeAmount(settled.bet.tableId))}`);
        reportUsageForBet(settled.bet.key);
        if (running) {
          const reason = riskStopReason(roundPnl(), riskLimits);
          if (reason) stop(reason);
        }
        window.dispatchEvent(new CustomEvent("dg-singlepage-settlement", { detail: { ...settled.bet, nextLevel: settled.nextLevel } }));
        window.setTimeout(() => official.refresh(true), 800);
      }
    }
    function migrateSingleChain() {
      if (ledger.state.levels.global != null || ledger.pending().length) return;
      const last = ledger.state.bets.filter((b) => b.state === "settled" && b.staking !== "flat").slice().sort((a, b) => (a.settledAt ?? a.createdAt) - (b.settledAt ?? b.createdAt)).at(-1);
      if (last) ledger.state.levels.global = ledger.level(last.tableId, last.scope);
    }
    function desiredScope() {
      return roomCount === "1" && singleStaking !== "flat" ? "global" : "table";
    }
    function stakingMode() {
      return roomCount === "1" ? singleStaking : "flat";
    }
    function amountLevel(tableId, mode = scope) {
      return stakingMode() === "flat" || !running && !ledger.pending().length && startMode === "fresh" ? 0 : ledger.level(tableId, mode);
    }
    function stakeAmount(tableId, amount = base, mode = scope) {
      return stakingAmount(amount, amountLevel(tableId, mode), stakingMode());
    }
    function stakeDiagnostics() {
      return { base: running || ledger.pending().length ? base : Number(q("base").value), startMode, staking: stakingMode(), levels: { ...ledger.state.levels }, tables: boards().map((c) => ({ table: c.gameInfo.tableName, tableId: String(c.tableId), savedLevel: ledger.level(String(c.tableId), scope), effectiveLevel: amountLevel(String(c.tableId)), nextAmount: stakeAmount(String(c.tableId), !running && !ledger.pending().length ? Number(q("base").value) : base) })), recentBets: ledger.state.bets.slice(-10).map((b) => ({ ...b })) };
    }
    function roundBets() {
      const from = ledger.state.roundStartIndex;
      return Number.isSafeInteger(from) && from >= 0 ? ledger.state.bets.slice(from).filter((b) => b.state === "settled") : ledger.state.bets.filter((b) => b.state === "settled" && (b.settledAt ?? b.createdAt) >= (ledger.state.roundStartedAt ?? mountedAt));
    }
    function roundPnl() {
      return roundBets().reduce((sum, b) => sum + (b.pnl ?? 0), 0);
    }
    function unacknowledgedFunds() {
      return ledger.pending().filter((b) => b.state !== "accepted").reduce((sum, b) => sum + b.amount, 0);
    }
    async function execute(card, token, budget) {
      if (stopIfTimeExpired()) return;
      const decision = strategyFor(card);
      if (!decision.side) {
        waitTable(card, decision.reason || "\u7B56\u7565\u8CC7\u6599\u4E0D\u8DB3");
        return;
      }
      const gameNo = String(card.gameInfo.gameNo ?? ""), tableId = String(card.tableId);
      if (!gameNo || ledger.state.bets.some((b) => b.key === `${tableId}:${gameNo}`)) return;
      if (!sameSession(card) || !ready(card)) return;
      if (Object.values(card.betMoneyTmp).some((v) => Number(v) !== 0) || Object.values(card.betMoneyTrue).some((v) => Number(v) !== 0)) {
        waitTable(card, "\u672C\u5C40\u5DF2\u6709\u539F\u751F\u4E0B\u6CE8\u6216\u5F85\u78BA\u8A8D\u7C4C\u78BC\uFF0C\u4E0D\u6DF7\u5408\u6295\u6CE8");
        return;
      }
      const side = decision.side;
      const amount = stakeAmount(tableId);
      if (amount > maxStake) {
        stop(`\u4E0B\u4E00\u6CE8 ${money(amount)} \u8D85\u904E\u4F60\u8A2D\u5B9A\u7684\u91D1\u984D\u4E0A\u9650 ${money(maxStake)}`);
        return;
      }
      if (amount > maxStake) {
        stop(`\u4E0B\u4E00\u6CE8 ${money(amount)} \u8D85\u904E\u55AE\u7B46\u4E0A\u9650 ${money(maxStake)}\uFF1B\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8`);
        return;
      }
      const riskPreflight = nextStakeRiskCheck(roundPnl(), riskLimits, ledger.pending(), amount);
      if (!riskPreflight.ok) {
        stop(riskPreflight.reason);
        return;
      }
      const preflight = checkDgAmount(card, amount);
      if (!preflight.ok) {
        waitTable(card, preflight.reason);
        return;
      }
      if (amount > budget.remaining) {
        waitTable(card, `\u540C\u6279\u53EF\u7528\u9918\u984D ${money(Math.max(0, budget.remaining))} \u4E0D\u8DB3 ${money(amount)}\uFF1B\u5176\u4ED6\u684C\u5DF2\u9810\u7559\uFF0C\u4E0D\u9001\u51FA`);
        return;
      }
      tableWait.delete(tableId);
      lastNotice.delete(tableId);
      const bet = ledger.reserve(tableId, gameNo, side, base, scope, stakingMode());
      bet.provider = provider;
      usageHistory.addBet(bet);
      persist();
      contexts.set(bet.key, card);
      const internalSide = side === "\u838A" ? "Banker" : "Player";
      function guard() {
        if (stopIfTimeExpired()) throw new Error("\u5DF2\u9054\u81EA\u52D5\u505C\u6B62\u6642\u9593\uFF0C\u6C92\u6709\u9001\u51FA\u65B0\u4E0B\u6CE8");
        if (window.__DG_MANUAL_CAPTURE_ACTIVE__) throw new Error("\u624B\u52D5\u6D41\u7A0B\u8A18\u9304\u4E2D\uFF0C\u5DE5\u5177\u4E0D\u9001\u55AE");
        if (!running || disposed || token !== epoch || document.hidden || String(card.gameInfo.gameNo) !== gameNo || !ready(card) || !sameSession(card)) throw new Error("\u5DF2\u505C\u6B62\u3001\u5C40\u865F\u6539\u8B8A\u6216\u505C\u6B62\u63A5\u53D7\u4E0B\u6CE8");
        const riskReason = riskStopReason(roundPnl(), riskLimits);
        if (riskReason) throw new Error(riskReason);
        const exposure = nextStakeRiskCheck(roundPnl(), riskLimits, ledger.pending(), amount, bet.key);
        if (!exposure.ok) throw new Error(exposure.reason);
        const check2 = checkDgAmount(card, amount);
        if (!check2.ok) throw new Error(check2.reason);
      }
      try {
        guard();
        if (typeof card.confirmBet !== "function") throw new Error("DG \u7248\u672C\u7F3A\u5C11\u53EF\u7528\u7684\u539F\u751F\u5C01\u5305\u5EFA\u69CB\u5668");
        let packet = null;
        const detached = Object.create(card);
        detached.betMoneyTmp = Object.fromEntries(Object.keys(card.betMoneyTmp).map((k) => [k, k === internalSide ? amount : 0]));
        detached.betMoneyTrue = Object.fromEntries(Object.keys(card.betMoneyTrue).map((k) => [k, 0]));
        if (getDgBetControls(card)?.profile === "mobile-v329") {
          if (!hasDgVerifiedMobilePacketBuilder(card)) throw new Error("\u624B\u6A5F\u539F\u751Fbuilder\u7248\u672C\u672A\u6838\u5C0D\uFF0C\u6C92\u6709\u50B3\u9001");
          detached.betBtn = Object.fromEntries(Object.entries(card.betBtn).map(([key, value]) => [key, Object.assign(Object.create(value), { hideHover: () => {
          } })]));
          detached.betBtnMan = Object.assign(Object.create(card.betBtnMan), { betFlag: true, visible: false });
        }
        detached.betFlag = true;
        detached.showBetMan = () => {
        };
        detached.showBetFailed = () => {
          throw new Error("DG \u539F\u751F\u9A57\u8B49\uFF0F\u5C01\u5305\u5EFA\u69CB\u5931\u6557");
        };
        detached.event = (name, msg) => {
          if (name === "BET_CHIP" && Number(msg?.cmd) === 6) {
            if (packet) throw new Error("\u5C01\u5305\u5EFA\u69CB\u5668\u56DE\u50B3\u591A\u7B46\u4E0B\u6CE8");
            packet = msg;
            return true;
          }
          throw new Error("\u5C01\u5305\u5EFA\u69CB\u5668\u56DE\u50B3\u975E\u9810\u671F\u4E8B\u4EF6");
        };
        card.confirmBet.call(detached);
        if (!packet || String(packet.tableId) !== tableId || String(packet.gameNo) !== gameNo) throw new Error("\u4E0B\u6CE8\u5C01\u5305\u684C\u865F\uFF0F\u5C40\u865F\u4E0D\u7B26\uFF0C\u6C92\u6709\u50B3\u9001");
        guard();
        ledger.submit(bet);
        persist();
        budget.remaining -= amount;
        nativeBetKey = bet.key;
        try {
          socket.sendData(packet);
        } finally {
          nativeBetKey = "";
        }
        log(`${tableId}\uFF5C${gameNo}\uFF5C\u5DF2\u76F4\u63A5\u50B3\u9001 cmd 6\uFF1A${side} ${money(amount)}\uFF1B\u7B49\u5F85\u5E73\u53F0\u63A5\u53D7\u56DE\u8986`);
      } catch (error46) {
        if (bet.state === "reserved") {
          ledger.abort(bet);
        } else ledger.uncertain(bet);
        persist();
        stop(String(error46.message));
      }
    }
    async function tick() {
      if (disposed) return;
      stopIfTimeExpired();
      if (busy) return;
      if (window.__DG_MANUAL_CAPTURE_ACTIVE__ && running) stop("\u624B\u52D5\u6D41\u7A0B\u8A18\u9304\u4E2D\uFF0C\u5DE5\u5177\u5DF2\u505C\u6B62");
      if (running && roomCount === "1" && scope === "global" && stakeAmount("global") > maxStake) stop(`\u4E0B\u4E00\u6CE8 ${money(stakeAmount("global"))} \u8D85\u904E\u55AE\u7B46\u4E0A\u9650 ${money(maxStake)}\uFF1B\u505C\u6B62\u65B0\u589E\u4E0B\u6CE8`);
      const all = nodes();
      pokerTracker.observe(boards(all));
      attach(all);
      autoScan(boards(all));
      trackRounds(boards(all));
      render();
      if (socket?.socket?.connected === false && ledger.pending().length) {
        for (const b of ledger.pending()) b.state = "uncertain";
        persist();
        stop("DG \u9023\u7DDA\u5DF2\u4E2D\u65B7\uFF1B\u5F85\u7D50\u7B97\u4E0B\u6CE8\u4FDD\u7559\u70BA\u672A\u78BA\u5B9A\uFF0C\u8ACB\u6838\u5C0D\u6B63\u5F0F\u7D00\u9304");
      }
      for (const b of ledger.pending()) {
        if (b.state === "submitted" && Date.now() - (b.submittedAt ?? b.createdAt) > 12e3) {
          ledger.uncertain(b);
          persist();
          stop("\u4E0B\u6CE8\u56DE\u8986\u903E\u6642\uFF1B\u4FDD\u7559\u672C\u5C40\u9396\u5B9A\uFF0C\u4E0D\u91CD\u9001");
        }
        if (running && b.state === "accepted" && Date.now() - (b.acceptedAt ?? b.createdAt) > 18e4) stop("\u5E73\u53F0\u7D50\u7B97\u903E\u6642\uFF1B\u5DF2\u505C\u6B62\uFF0C\u4FDD\u7559\u5F85\u7D50\u7B97\u5E33\u672C");
      }
      if (!running || !socket || document.hidden) return;
      const riskReason = riskStopReason(roundPnl(), riskLimits);
      if (riskReason) {
        stop(riskReason);
        return;
      }
      const cards = boards(all).filter((c) => selected.has(String(c.tableId)));
      const budget = { remaining: Math.max(0, Number(account?.balance ?? 0) - unacknowledgedFunds()) };
      const current = epoch;
      busy = true;
      try {
        for (const card of cards) {
          if (!running || epoch !== current) break;
          if (ledger.pending().some((b) => scope === "global" || b.scope === "global" || b.tableId === String(card.tableId))) continue;
          if (ready(card)) await execute(card, current, budget);
          if (once && ledger.pending().length) break;
        }
      } catch (e) {
        stop(String(e.message));
      } finally {
        busy = false;
      }
    }
    const host = document.createElement("div");
    host.id = "__dg_singlepage_panel__";
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = DG_PANEL_HTML;
    const cleanupFeedback = installDgButtonFeedback(shadow);
    const cleanupTouchScroll = installDgPanelTouchScroll(shadow);
    const mountedAt = Date.now();
    let summarySince = mountedAt;
    const q = (id) => shadow.getElementById(id);
    q("panel").classList.toggle("compact", compact);
    q("count").value = q("parallel-count").value = roomCount;
    const riskInputDrafts = createDgRiskInputDrafts(stakingMode());
    const initialRiskInputs = riskInputDrafts.initial();
    q("stop-loss").value = initialRiskInputs.stopLoss;
    q("take-profit").value = initialRiskInputs.takeProfit;
    function syncRiskInputMode() {
      const values = riskInputDrafts.switchTo(stakingMode(), { stopLoss: q("stop-loss").value, takeProfit: q("take-profit").value });
      q("stop-loss").value = values.stopLoss;
      q("take-profit").value = values.takeProfit;
    }
    for (const option of AI_PROVIDER_OPTIONS) {
      const el = document.createElement("option");
      el.value = option.key;
      el.textContent = option.label;
      q("provider").appendChild(el);
    }
    q("provider").value = provider;
    const providerMenu = installDgProviderMenu(shadow, AI_PROVIDER_OPTIONS);
    const official = createDgOfficialTurnover(window, () => account, () => !busy);
    function selectionLocked() {
      return running || busy || ledger.pending().length > 0;
    }
    function openForAuto(card) {
      const id = String(card.tableId), gameNo = String(card.gameInfo?.gameNo ?? "");
      if (!gameNo || !ready(card) || !sameSession(card)) return false;
      if (ledger.state.bets.some((b) => b.key === `${id}:${gameNo}`)) return false;
      if (roads(card).filter((x) => x !== "\u548C").length < 3) return false;
      if (Object.values(card.betMoneyTmp).some((v) => Number(v) !== 0) || Object.values(card.betMoneyTrue).some((v) => Number(v) !== 0)) return false;
      const amount = stakeAmount(id);
      return amount <= maxStake && checkDgAmount(card, amount).ok;
    }
    function autoScan(cards) {
      if (manualSelection || !q("rooms-page").hidden && !running) return;
      const pending = ledger.pending().map((b) => b.tableId);
      const eligible = cards.filter(openForAuto).map((c) => String(c.tableId));
      const ids = running ? selectOpenDgTables(eligible, pending, roomCount) : syncDgTables(eligible.length ? eligible : cards.map((c) => String(c.tableId)), [...selected], pending, roomCount);
      if (ids.length === selected.size && ids.every((id) => selected.has(id))) return;
      selected = new Set(ids);
      renderRooms();
      log(`\u81EA\u52D5\u627E\u684C\uFF1A\u5DF2\u9078 ${selected.size} \u684C\uFF1B\u6709\u53EF\u4E0B\u6CE8\u7A7A\u4F4D\u5C31\u57F7\u884C`);
    }
    function selectCount(value) {
      if (!["1", "3", "5", "all"].includes(value)) return;
      if (selectionLocked()) {
        q("count").value = q("parallel-count").value = roomCount;
        log("\u5148\u505C\u6B62\u4E26\u7B49\u5DF2\u9001\u51FA\u4E0B\u6CE8\u7D50\u7B97\uFF0C\u624D\u80FD\u8B8A\u66F4\u540C\u6642\u684C\u6578");
        return;
      }
      roomCount = value;
      scope = desiredScope();
      syncRiskInputMode();
      q("count").value = q("parallel-count").value = value;
      if (manualSelection && value !== "all") selected = new Set([...selected].slice(0, Number(value)));
      scan();
    }
    function scan() {
      if (selectionLocked()) {
        log("\u5148\u505C\u6B62\u4E26\u7B49\u5DF2\u9001\u51FA\u4E0B\u6CE8\u7D50\u7B97\uFF0C\u624D\u80FD\u8B8A\u66F4\u684C\u53F0\u6216\u7B56\u7565");
        return;
      }
      const cards = boards(), limit = roomCount === "all" ? cards.length : Number(roomCount);
      if (!manualSelection) selected = new Set(cards.slice(0, limit).map((c) => String(c.tableId)));
      autoScan(cards);
      log(cards.length ? `\u627E\u5230 ${cards.length} \u500B\u55AE\u9801\u684C\u53F0\uFF1B\u540C\u6642\u9078\u4E2D ${selected.size} \u684C${roomCount !== "all" && selected.size < limit ? `\uFF08\u8981\u6C42 ${limit} \u684C\uFF0C\u76EE\u524D\u50C5\u8F09\u5165 ${selected.size} \u684C\uFF09` : ""}` : "\u5C1A\u672A\u627E\u5230 DG \u55AE\u9801\u591A\u684C\u8CC7\u6599\uFF1B\u8ACB\u958B\u555F DG \u591A\u53F0\u6216\u53F3\u5074\u597D\u8DEF\u4E0B\u6CE8\u9762\u677F");
      renderRooms();
    }
    function renderRooms() {
      q("rooms").replaceChildren();
      for (const c of boards()) {
        const button = document.createElement("button"), id = String(c.tableId);
        button.className = "room" + (selected.has(id) ? " active" : "");
        button.setAttribute("aria-pressed", String(selected.has(id)));
        button.disabled = selectionLocked();
        const title = document.createElement("span");
        title.className = "room-title";
        const name = document.createElement("strong");
        name.textContent = c.gameInfo.tableName || id;
        const check2 = document.createElement("span");
        check2.className = "room-check";
        check2.textContent = "\u2713";
        check2.setAttribute("aria-hidden", "true");
        title.append(name, check2);
        const detail = document.createElement("span");
        detail.className = "room-detail";
        detail.textContent = selected.has(id) ? "\u5DF2\u9078\u64C7 \xB7 \u7368\u7ACB\u8A08\u7B97\u65B9\u5411" : "\u9EDE\u9078\u52A0\u5165\u4E0B\u6CE8\u7BC4\u570D";
        button.append(title, detail);
        button.onclick = () => {
          if (selectionLocked()) return;
          if (selected.has(id)) {
            manualSelection = true;
            selected.delete(id);
          } else if (roomCount === "all" || selected.size < Number(roomCount)) {
            manualSelection = true;
            selected.add(id);
          } else {
            log(`\u540C\u6642 ${roomCount} \u684C\u5DF2\u6EFF\uFF0C\u5148\u53D6\u6D88\u4E00\u684C\u518D\u9078\u5176\u4ED6\u684C`);
            return;
          }
          renderRooms();
          render();
        };
        q("rooms").appendChild(button);
      }
    }
    function start(testOnce = false) {
      if (running) {
        log("\u76EE\u524D\u4ECD\u5728\u57F7\u884C\uFF0C\u8ACB\u5148\u505C\u6B62\u518D\u91CD\u65B0\u958B\u59CB\uFF1B\u4F7F\u7528\u6642\u9593\u4E0D\u91CD\u8A2D");
        return;
      }
      if (window.__DG_MANUAL_CAPTURE_ACTIVE__) {
        log("\u624B\u52D5\u6D41\u7A0B\u8A18\u9304\u4E2D\uFF0C\u4E0D\u80FD\u958B\u555F\u81EA\u52D5\u4E0B\u6CE8");
        return;
      }
      if (busy) {
        log("\u4E0A\u4E00\u6D41\u7A0B\u5C1A\u672A\u9000\u51FA\uFF0C\u8ACB\u7A0D\u5019\u518D\u958B\u59CB");
        return;
      }
      if (!riskApproved) {
        requestStart(testOnce);
        return;
      }
      riskApproved = false;
      if (startMode === "fresh" && ledger.pending().length) {
        log("\u65B0\u958B\u59CB\u9808\u7B49\u5F85\u6240\u6709\u5DF2\u9001\u51FA\u55AE\u7D50\u7B97\uFF1B\u53EF\u9078\u7E8C\u63A5\uFF0C\u4F46\u4E0D\u6E05\u9664\u5F85\u7D50\u7B97\u55AE");
        return;
      }
      if (ledger.pending().some((b) => b.state === "uncertain")) {
        log("\u6709\u672A\u80FD\u6838\u5C0D\u7684\u4E0B\u6CE8\uFF0C\u4FDD\u6301\u505C\u6B62\uFF1B\u8ACB\u5148\u67E5\u770B DG \u6B63\u5F0F\u4E0B\u6CE8\u7D00\u9304");
        return;
      }
      let durationMinutes;
      try {
        durationMinutes = parseDurationMinutes(q("duration-minutes").value);
      } catch (e) {
        log(e.message);
        return;
      }
      let nextRisk;
      try {
        nextRisk = parseRiskLimits(q("stop-loss").value, q("take-profit").value);
      } catch (e) {
        log(e.message);
        return;
      }
      if (ledger.pending().length && (nextRisk.stopLoss !== riskLimits.stopLoss || nextRisk.takeProfit !== riskLimits.takeProfit)) {
        log("\u5F85\u7D50\u7B97\u671F\u9593\u4E0D\u80FD\u6539\u6B62\u640D\uFF0F\u6B62\u76C8");
        return;
      }
      if (stakingMode() === "martingale" && (nextRisk.stopLoss === null || nextRisk.stopLoss < 2600)) {
        log("\u99AC\u4E01\u914D\u6CE8\u9808\u8A2D\u5B9A\u6B62\u640D\uFF0C\u6700\u4F4E 2,600\uFF1B\u6C92\u6709\u958B\u59CB");
        return;
      }
      const riskReason = riskStopReason(startMode === "fresh" ? 0 : roundPnl(), nextRisk);
      if (riskReason) {
        log(riskReason + "\uFF1B\u5168\u6578\u7D50\u7B97\u5F8C\u53EF\u9078\u65B0\u958B\u59CB\u91CD\u8A2D\u672C\u8F2A");
        return;
      }
      const nextBase = Number(q("base").value), nextScope = desiredScope(), nextProvider = q("provider").value;
      if (ledger.pending().length && (nextBase !== base || nextScope !== scope || nextProvider !== provider)) {
        log("\u5F85\u7D50\u7B97\u671F\u9593\u4E0D\u80FD\u6539\u57FA\u672C\u91D1\u984D\u3001\u7B56\u7565\u6216\u5E33\u672C");
        return;
      }
      if (!Number.isSafeInteger(nextBase) || nextBase <= 0) {
        log("\u57FA\u672C\u55AE\u6CE8\u5FC5\u9808\u662F\u6B63\u6574\u6578");
        return;
      }
      if (!AI_PROVIDER_OPTIONS.some((x) => x.key === nextProvider)) {
        log("\u63A8\u85A6\u4F86\u6E90\u7121\u6548\uFF0C\u6C92\u6709\u958B\u59CB");
        return;
      }
      const nextStaking = stakingMode();
      attach(nodes());
      if (!boards().length) {
        log("\u5C1A\u672A\u8FA8\u8B58\u539F\u751F\u591A\u684C\u5361\u7247\uFF0C\u6C92\u6709\u958B\u59CB\uFF1B\u8ACB\u532F\u51FA DG \u9023\u7DDA\u8A3A\u65B7");
        return;
      }
      if (!socket || socket.socket?.connected === false) {
        log("\u539F\u751F\u904A\u6232\u9023\u7DDA\u5C1A\u672A\u5C31\u7DD2\uFF0C\u6C92\u6709\u958B\u59CB");
        return;
      }
      if (dgSceneWallet(walletPlayer) === null) {
        log("\u539F\u751F\u9918\u984D\u5C1A\u672A\u540C\u6B65\uFF0C\u6C92\u6709\u958B\u59CB");
        return;
      }
      if (ledger.pending().length && nextStaking !== stakingMode()) {
        log("\u7B49\u5F85\u4E0B\u6CE8\u7D50\u7B97\u5F8C\u624D\u80FD\u8B8A\u66F4\u914D\u6CE8\u65B9\u5F0F");
        return;
      }
      if (roomCount === "1") singleStaking = nextStaking;
      maxStake = Number(q("cap").value);
      if (!Number.isSafeInteger(maxStake) || maxStake < nextBase) {
        log("\u55AE\u7B46\u4E0A\u9650\u5FC5\u9808\u4E0D\u5C0F\u65BC\u57FA\u672C\u55AE\u6CE8");
        return;
      }
      base = nextBase;
      scope = nextScope;
      provider = nextProvider;
      riskLimits = nextRisk;
      if (!selected.size) scan();
      if (!selected.size && manualSelection) {
        log("\u6307\u5B9A\u684C\u6A21\u5F0F\u5C1A\u672A\u9078\u684C\uFF1B\u5148\u9078\u684C\u6216\u5207\u56DE\u81EA\u52D5\u627E\u684C");
        return;
      }
      if (roomCount !== "1" && ledger.pending().some((b) => b.scope === "global")) {
        log("\u820A\u7248\u5171\u7528\u5E33\u672C\u4ECD\u6709\u5F85\u7D50\u7B97\u4E0B\u6CE8\uFF1B\u5148\u7B49\u6B63\u5F0F\u7D50\u7B97\u518D\u958B\u59CB\u540C\u6642\u591A\u684C");
        return;
      }
      if (startMode === "fresh") {
        ledger.resetLevels();
        ledger.state.roundStartIndex = ledger.state.bets.length;
        ledger.state.roundStartedAt = Date.now();
        persist();
        log(`\u65B0\u958B\u59CB\uFF1A\u57FA\u672C\u55AE\u6CE8 ${money(base)}\uFF0C\u914D\u6CE8\u5F9E\u7B2C1\u968E\u958B\u59CB\uFF1B\u4E0B\u6CE8\u7D00\u9304\u4FDD\u7559`);
      }
      summarySince = Date.now();
      runEventId = usageHistory.begin(durationMinutes);
      markUsageReportable(runEventId);
      sessionTimer.start(durationMinutes);
      persistUsage();
      running = true;
      once = testOnce;
      epoch++;
      activeSettings = { version: DG_SETTINGS_VERSION, gamePlatform: "DG", runMode: testOnce ? "once" : "continuous", startMode, provider, tableCount: roomCount, selectionMode: manualSelection ? "manual" : "auto", selectedTables: boards().filter((c) => selected.has(String(c.tableId))).map((c) => ({ tableId: String(c.tableId), tableName: String(c.gameInfo.tableName || c.tableId) })), baseAmount: base, staking: stakingMode(), maxStake, stopLoss: riskLimits.stopLoss, takeProfit: riskLimits.takeProfit, durationMinutes, minSeconds, currency: String(account?.currency ?? "UNKNOWN") };
      settingsSyncState = "pending";
      try {
        window.dispatchEvent(new CustomEvent(DG_SETTINGS_EVENT, { detail: { eventId: runEventId, settings: JSON.parse(JSON.stringify(activeSettings)) } }));
      } catch {
        settingsSyncState = "failed";
      }
      reportUsage(runEventId, true);
      log(testOnce ? "\u6E2C\u8A66\u4E00\u7B46\u5B8C\u6574\u6D41\u7A0B\uFF08\u4E0D\u662F\u591A\u684C\u6279\u6B21\uFF09" : roomCount === "1" && stakingMode() !== "flat" ? `\u540C\u6642 1 \u684C\u555F\u52D5\uFF1A\u8DE8\u623F\u9593\u63A5\u7E8C${stakingMode() === "doubling" ? "\u500D\u6295\u6CD5" : "\u99AC\u4E01"}\uFF0C\u7D50\u7B97\u5F8C\u624D\u627E\u4E0B\u4E00\u684C` : `\u540C\u6642 ${selected.size} \u684C\u555F\u52D5\uFF1A\u5404\u684C\u56FA\u5B9A\u5E73\u6CE8\uFF0C\u4E0D\u7B49\u5176\u4ED6\u684C\u7D50\u7B97`);
      void tick();
    }
    function showPage(name) {
      providerMenu.close();
      if (mini && name !== "overview") setMini(false);
      for (const page of ["overview", "settings", "logs", "rooms"]) q(page + "-page").hidden = page !== name;
      for (const page of ["overview", "settings", "logs"]) q("nav-" + page).classList.toggle("active", page === name);
      fitPanel();
    }
    function fitPanel() {
      const top = host.getBoundingClientRect().top;
      const overlay = !q("risk-dialog").hidden || !q("report-shell").hidden;
      const width = mini && !overlay ? 210 : panelWidth;
      const widthScale = Math.min(userZoom, (window.innerWidth - 24) / width);
      const fullHeight = Math.min(panelHeight, Math.max(280, (window.innerHeight - top - 16) / Math.max(0.2, widthScale)));
      host.style.setProperty("--full-height", fullHeight + "px");
      host.style.setProperty("--full-width", panelWidth + "px");
      const height = mini && !overlay ? Math.max(228, q("panel").scrollHeight) : fullHeight;
      const scale = Math.min(widthScale, (window.innerHeight - top - 12) / height);
      host.style.setProperty("--fit", String(Math.max(0.2, scale)));
      q("zoom-label").textContent = `${Math.round(scale * 100)}%`;
    }
    function render() {
      if (disposed) return;
      renderOfficialTurnover(shadow, official.view());
      const usage = sessionTimer.view();
      if (usageHistory.updateElapsed(usage.elapsedMs)) persistUsage();
      if (running && runEventId) reportUsage(runEventId);
      q("session-elapsed").textContent = usage.elapsedText;
      const lastUsage = usageHistory.view().find((r) => r.state !== "active");
      q("last-usage").textContent = lastUsage ? `\u4E0A\u6B21 ${lastUsage.elapsedText} \xB7 \u5DF2\u7D50\u7B97\u8F38\u8D0F ${lastUsage.pnl > 0 ? "+" : ""}${money(lastUsage.pnl)}${lastUsage.pendingCount ? " \xB7 \u5F85\u7D50\u7B97 " + lastUsage.pendingCount : ""}${lastUsage.uncertainCount ? " \xB7 \u672A\u78BA\u5B9A " + lastUsage.uncertainCount : ""}` : "\u5C1A\u7121\u4E0A\u6B21\u4F7F\u7528\u7D00\u9304";
      q("last-usage").title = q("last-usage").textContent;
      const limit = usage.started ? usage.minutes : (() => {
        try {
          return parseDurationMinutes(q("duration-minutes").value);
        } catch {
          return null;
        }
      })();
      q("session-remaining").textContent = usage.started && usage.remainingMs !== null ? `\u5269\u9918 ${formatDuration(usage.remainingMs)}` : limit === null ? "\u6642\u9650\u683C\u5F0F\u932F\u8AA4" : limit ? `\u8A2D\u5B9A ${limit} \u5206\u9418` : "\u4E0D\u9650\u6642";
      q("duration-minutes").disabled = selectionLocked();
      q("status").textContent = `${running ? "\u57F7\u884C\u4E2D" : "\u5DF2\u505C\u6B62"}\uFF5C${userStatus(status)}`;
      let heroText = userStatus(status);
      const eventSignature = logs.join("\n");
      if (eventSignature !== lastRenderedEvents) {
        lastRenderedEvents = eventSignature;
        q("events").replaceChildren();
        for (const text of logs) {
          const entry = document.createElement("article");
          entry.className = "event-card" + (/平台已接受|結算 [+-]/.test(text) ? " accepted" : /失敗|拒絕|不足|逾時|未下到/.test(text) ? " warning" : "");
          const first = text.indexOf(" "), time3 = document.createElement("time");
          time3.textContent = first >= 0 ? text.slice(0, first) : "";
          const body = document.createElement("p");
          body.textContent = userStatus(first >= 0 ? text.slice(first + 1) : text);
          entry.append(time3, body);
          q("events").append(entry);
        }
      }
      for (const button of q("rooms").querySelectorAll("button")) button.disabled = selectionLocked();
      const cards = boards(), chosen = cards.filter((c) => selected.has(String(c.tableId))), pending = ledger.pending();
      const tableNames = {};
      for (const c of [...contexts.values(), ...cards]) tableNames[String(c.tableId)] = c.gameInfo?.tableName || String(c.tableId);
      const summaries = dgBetSummary(ledger.state.bets, tableNames, summarySince);
      const normalStatus = /平台已接受下注|結算 |已直接傳送|自動找桌|同時 \d+|找到 |新開始/.test(status);
      if (summaries.success && normalStatus) heroText = "\u4E0B\u6CE8\u6210\u529F\uFF1A" + summaries.success;
      else if (summaries.confirming && normalStatus) heroText = "\u5F85\u78BA\u8A8D\uFF1A" + summaries.confirming;
      if (q("hero-status").textContent !== heroText) q("hero-status").textContent = heroText;
      q("hero-status").title = heroText;
      const currentBet = pending[0];
      const focus = chosen.find((c) => String(c.tableId) === currentBet?.tableId) ?? chosen.find(ready) ?? chosen[0];
      const previewBase = !running && !pending.length && Number.isSafeInteger(Number(q("base").value)) && Number(q("base").value) > 0 ? Number(q("base").value) : base;
      const previewProvider = q("provider").value;
      const strategyLabel = AI_PROVIDER_OPTIONS.find((x) => x.key === previewProvider)?.label ?? "\u672C\u5730\u7B56\u7565";
      q("current-strategy").textContent = strategyLabel;
      providerMenu.sync();
      const previewScope = !running && !pending.length ? desiredScope() : scope;
      const settled = roundBets();
      const pnl = settled.reduce((sum, b) => sum + (b.pnl ?? 0), 0);
      const wins = settled.filter((b) => (b.pnl ?? 0) > 0).length, losses = settled.filter((b) => (b.pnl ?? 0) < 0).length, ties = settled.length - wins - losses;
      q("brand-count").textContent = "\u767E\u5BB6\u5DE5\u7A0B\u5E2B";
      const wallet = dgSceneWallet(walletPlayer);
      q("balance").textContent = wallet === null ? "\u5F85\u540C\u6B65" : money(wallet);
      q("mini-balance").textContent = q("balance").textContent;
      q("mini-running").textContent = `${running ? selected.size ? "\u57F7\u884C\u4E2D" : "\u7B49\u5F85\u958B\u76E4" : pending.length ? "\u5F85\u7D50\u7B97" : "\u5DF2\u505C\u6B62"} \xB7 ${mini ? selected.size + "\u684C" : manualSelection ? "\u6307\u5B9A\u684C" : "\u81EA\u52D5\u627E\u684C"}`;
      q("auto-tables").disabled = selectionLocked();
      q("auto-tables").classList.toggle("selected", !manualSelection);
      q("auto-tables").textContent = manualSelection ? "\u5207\u56DE\u81EA\u52D5\u627E\u684C" : "\u81EA\u52D5\u627E\u684C\u4E2D";
      q("selection-mode").textContent = manualSelection ? "\u6307\u5B9A\u684C\u53F0 \xB7 \u4E0D\u81EA\u52D5\u88DC\u5176\u4ED6\u684C" : "\u81EA\u52D5\u627E\u684C \xB7 \u958B\u653E\u4E0B\u6CE8\u5C31\u52A0\u5165";
      q("scope").options[0].textContent = stakingMode() === "flat" ? "\u5E73\u6CE8 \xB7 \u91D1\u984D\u56FA\u5B9A" : stakingMode() === "doubling" ? "\u55AE\u684C\u5171\u7528\u500D\u6295 \xB7 \u63DB\u623F\u63A5\u7E8C 1\u21922\u21924\u21928" : "\u55AE\u684C\u5171\u7528\u99AC\u4E01 \xB7 \u63DB\u623F\u63A5\u7E8C 1\u21923\u21927\u219215";
      q("doubling-reminder").hidden = stakingMode() !== "doubling";
      q("single-staking").value = stakingMode();
      q("single-staking").disabled = roomCount !== "1" || selectionLocked();
      q("start-mode").value = startMode;
      q("start-mode").disabled = selectionLocked();
      q("staking-hint").textContent = roomCount === "1" ? singleStaking === "flat" ? "\u55AE\u684C\u5E73\u6CE8\uFF1A\u6BCF\u7B46\u56FA\u5B9A\u57FA\u672C\u984D\uFF0C\u63DB\u623F\u4E0D\u52A0\u6CE8\u3002" : `\u8DE8\u623F\u9593\u63A5\u7E8C${singleStaking === "doubling" ? "\u500D\u62951\u21922\u21924\u21928" : "\u99AC\u4E011\u21923\u21927\u219215"}\uFF1A\u8F38\u5347\u968E\u3001\u8D0F\u91CD\u7F6E\u3001\u548C\u7DAD\u6301\u3002${startMode === "fresh" ? "\u65B0\u958B\u59CB\u9996\u7B46\u57FA\u672C\u984D\u3002" : "\u7E8C\u63A5\u4FDD\u7559\u5171\u7528\u968E\u7D1A\u3002"}` : "\u591A\u684C\u56FA\u5B9A\u5E73\u6CE8\uFF0C\u4E0D\u53EF\u66F4\u6539\u3002";
      q("stop-loss").disabled = q("take-profit").disabled = q("base").disabled = q("cap").disabled = selectionLocked();
      q("stop-loss").min = stakingMode() === "martingale" ? "2600" : "1";
      q("provider").disabled = q("provider-trigger").disabled = selectionLocked();
      if (selectionLocked()) providerMenu.close();
      q("run-pill").textContent = running ? "\u25CF \u81EA\u52D5\u4E0B\u6CE8\u4E2D" : pending.length ? "\u25CF \u5F85\u7D50\u7B97" : "\u25CF \u5DF2\u505C\u6B62";
      q("run-pill").classList.toggle("idle", !running);
      q("method").textContent = `${stakingMode() === "flat" ? "\u5E73\u6CE8 \xB7 \u56FA\u5B9A\u91D1\u984D" : stakingMode() === "doubling" ? "\u55AE\u684C \xB7 \u500D\u6295\u6CD5" : "\u55AE\u684C \xB7 \u99AC\u4E01"}\uFF08${selected.size} \u684C\uFF09`;
      q("parallel-count").value = q("count").value = roomCount;
      q("parallel-count").disabled = q("count").disabled = q("scan").disabled = selectionLocked();
      q("parallel-summary").textContent = `\u5DF2\u9078 ${selected.size} \u684C \xB7 \u5F85\u63A5\u53D7 ${pending.filter((b) => b.state !== "accepted").length} \xB7 \u5F85\u7D50\u7B97 ${pending.filter((b) => b.state === "accepted").length}`;
      const rec = focus ? strategyFor(focus, previewProvider) : null;
      let focusTableText = focus ? focus.gameInfo.tableName || String(focus.tableId) : "\u5C0B\u627E\u53EF\u4E0B\u6CE8\u684C";
      let focusPhaseText = currentBet ? currentBet.state === "accepted" ? "\u7B49\u5F85\u7D50\u7B97" : currentBet.state === "uncertain" ? "\u56DE\u8986\u672A\u78BA\u5B9A" : "\u7B49\u5F85\u63A5\u53D7" : focus && ready(focus) ? "\u53EF\u4E0B\u6CE8" : "\u6E96\u5099\u4E2D";
      const focusId = focus ? String(focus.tableId) : "";
      const shownLevel = currentBet?.level ?? amountLevel(focusId, previewScope);
      const shownStaking = currentBet?.staking ?? stakingMode();
      const multiplier = shownStaking === "flat" ? 1 : shownStaking === "doubling" ? 2 ** shownLevel : 2 ** (shownLevel + 1) - 1;
      const label = currentBet ? currentBet.state === "accepted" ? "\u5DF2\u63A5\u53D7\u91D1\u984D" : currentBet.state === "uncertain" ? "\u672A\u78BA\u5B9A\u91D1\u984D" : "\u5DF2\u9001\u51FA\u91D1\u984D" : "\u4E0B\u4E00\u6CE8\u9810\u89BD";
      q("amount-label").textContent = !running && !pending.length && (!Number.isSafeInteger(Number(q("base").value)) || Number(q("base").value) <= 0) ? "\u57FA\u672C\u55AE\u6CE8\u9808\u70BA\u6B63\u6574\u6578" : label;
      q("amount-rule").textContent = `\u57FA\u672C ${money(currentBet ? currentBet.amount / multiplier : previewBase)} \xB7 ${shownStaking === "flat" ? "\u5E73\u6CE8 \xD71" : `\u7B2C${shownLevel + 1}\u968E \xD7${multiplier}`}`;
      q("amount").textContent = money(currentBet?.amount ?? stakeAmount(focusId, previewBase, previewScope));
      q("amount").title = label + "\uFF5C" + q("amount-rule").textContent;
      q("amount").classList.toggle("long-number", q("amount").textContent.length > 7);
      const side = currentBet?.side ?? rec?.side;
      q("side").textContent = side ? `${side} ${currentBet ? "\u4E0B\u6CE8" : "\u63A8\u85A6"}` : "\u2014";
      q("side").classList.toggle("player", side === "\u9592");
      const seconds = focus ? Math.floor(remaining(focus)) : null;
      q("countdown").textContent = seconds !== null ? String(seconds) : "\u2014";
      q("ring").style.setProperty("--progress", `${seconds !== null ? Math.min(1, seconds / Math.max(1, Number(focus.gameInfo.countDown))) * 360 : 0}deg`);
      q("focus-meta").textContent = focus ? `\u9774 ${focus.gameInfo.shoeId ?? "\u2014"} \xB7 \u5C40 ${focus.gameInfo.playId ?? "\u2014"} \xB7 ${getPatternInfo(roads(focus)).label} \xB7 ${strategyLabel}` : `${strategyLabel} \xB7 \u7B49\u5019\u724C\u8DEF\u8207\u5012\u6578`;
      if (rec?.reason && !currentBet) q("focus-meta").textContent += " \xB7 " + rec.reason;
      if (currentBet) {
        const original = AI_PROVIDER_OPTIONS.find((x) => x.key === currentBet.provider)?.label;
        q("focus-meta").textContent += original && original !== strategyLabel ? `\uFF5C\u6B64\u55AE ${original}` : "";
      }
      if (!focus && !currentBet) {
        focusPhaseText = cards.length ? "\u7B49\u5F85\u958B\u76E4" : "\u684C\u5361\u672A\u63A5\u901A";
        q("focus-meta").textContent = cards.length ? `\u5DF2\u8FA8\u8B58 ${cards.length} \u684C\uFF1B\u7B49\u5F85\u958B\u76E4\u3001\u8DB3\u5920\u5012\u6578\u8207\u724C\u8DEF` : "\u5C1A\u672A\u8FA8\u8B58\u539F\u751F\u684C\u5361\uFF0C\u672A\u9001\u55AE\uFF1B\u8ACB\u532F\u51FA\u9023\u7DDA\u8A3A\u65B7";
      }
      if (summaries.waiting || summaries.confirming || summaries.uncertain) {
        focusTableText = summaries.waiting ? "\u7B49\u5F85\u7D50\u7B97\uFF1A" : summaries.uncertain ? "\u672A\u78BA\u5B9A\uFF1A" : "\u5F85\u78BA\u8A8D\uFF1A";
        focusPhaseText = summaries.waiting ? summaries.waiting + (summaries.confirming ? " \uFF5C\u5F85\u78BA\u8A8D\uFF1A" + summaries.confirming : "") + (summaries.uncertain ? " \uFF5C\u672A\u78BA\u5B9A\uFF1A" + summaries.uncertain : "") : summaries.uncertain ? summaries.uncertain + (summaries.confirming ? " \uFF5C\u5F85\u78BA\u8A8D\uFF1A" + summaries.confirming : "") : summaries.confirming;
      }
      if (q("focus-table").textContent !== focusTableText) q("focus-table").textContent = focusTableText;
      if (q("focus-phase").textContent !== focusPhaseText) q("focus-phase").textContent = focusPhaseText;
      q("focus-phase").title = focusTableText + focusPhaseText;
      const stage = currentBet ? currentBet.state === "accepted" ? 3 : 2 : running ? 1 : 0;
      for (let i = 1; i <= 4; i++) q("step-" + i).classList.toggle("active", i <= stage);
      const seeking = running && !currentBet;
      q("search-box").hidden = compact || !seeking;
      q("target-box").hidden = !compact && seeking;
      q("search-title").textContent = compact ? "\u6311\u9078\u4E0B\u6CE8\u55AE\u2026" : "\u6311\u9078\u4E0B\u6CE8\u684C\u2026";
      q("countdown").textContent = seconds === 0 && currentBet ? "\u2298" : seconds !== null ? String(seconds) : "\u2014";
      q("ring").style.background = seconds === 0 ? "#55525866" : `conic-gradient(${seconds !== null && seconds <= 5 ? "#c8a555" : "#73997a"} ${seconds !== null ? Math.min(1, seconds / Math.max(1, Number(focus.gameInfo.countDown))) * 360 : 0}deg,#52565344 0)`;
      const low = q("range-min").value, high = q("range-max").value;
      const rangeSummary = chartSummary(settled);
      q("range-low").textContent = money(rangeSummary.low);
      q("range-high").textContent = money(rangeSummary.high);
      const position = rangePosition(pnl, low, high);
      q("pnl-range").hidden = true;
      const points = cumulativePoints(settled), chart = chartSummary(settled);
      q("pnl-line").setAttribute("points", points);
      q("pnl-chart").classList.toggle("red", pnl < 0);
      const zero = 39 - (0 - chart.low) / (chart.high - chart.low || 1) * 35;
      const endpoint = points.split(" ").at(-1).split(",");
      q("chart-zero").setAttribute("y1", String(zero));
      q("chart-zero").setAttribute("y2", String(zero));
      q("chart-dot").setAttribute("cx", endpoint[0]);
      q("chart-dot").setAttribute("cy", endpoint[1]);
      q("chart-area").setAttribute("points", chart.count ? `0,${zero} ${points} 250,${zero}` : "");
      q("chart-empty").hidden = chart.count > 0;
      q("chart-dot").style.opacity = chart.count ? "1" : "0";
      q("pnl-line").style.opacity = chart.count ? "1" : ".2";
      q("chart-last").textContent = chart.count ? (pnl > 0 ? "+" : "") + money(pnl) : "\u5C1A\u7121\u7D50\u7B97";
      q("chart-low").textContent = chart.count ? `\u6700\u4F4E ${money(chart.low)}` : "\u6700\u4F4E \u2014";
      q("chart-high").textContent = chart.count ? `\u6700\u9AD8 ${money(chart.high)}` : "\u6700\u9AD8 \u2014";
      q("chart-count").textContent = `${chart.count} \u6CE8`;
      q("cards-result").hidden = true;
      if (focus && currentBet && String(focus.gameInfo.gameNo) === currentBet.gameNo) {
        const poker = knownPoker(focus.gameInfo.poker);
        if (poker) {
          q("cards-result").hidden = false;
          for (const side2 of ["player", "banker"]) {
            q(side2 + "-cards").replaceChildren();
            for (const id of poker[side2]) {
              const card = document.createElement("span");
              card.className = "playing-card";
              card.textContent = pokerRank(id);
              q(side2 + "-cards").append(card);
            }
            q(side2 + "-point").textContent = String(pokerPoint(poker[side2]));
          }
        }
      }
      for (const id of ["hero-pnl", "round-pnl"]) {
        q(id).textContent = (pnl > 0 ? "+" : "") + money(pnl);
        q(id).classList.toggle("green", pnl > 0);
        q(id).classList.toggle("red", pnl < 0);
      }
      q("round-wlt").textContent = `${wins}/${losses}/${ties}`;
      q("hit-rate").textContent = wins + losses ? `${(wins / (wins + losses) * 100).toFixed(1)}%` : "\u2014";
      q("stop-now").classList.toggle("live", running);
      q("stop-now").textContent = running ? "\u25A0  \u505C\u6B62\u81EA\u52D5\u4E0B\u6CE8" : "\u25B6  \u958B\u59CB\u81EA\u52D5\u4E0B\u6CE8";
      q("tables").replaceChildren();
      q("table-strip").replaceChildren();
      for (const c of chosen) {
        const results = roads(c), r = strategyFor(c, previewProvider);
        const ownPending = pending.find((b) => b.tableId === String(c.tableId));
        const shownSide = ownPending?.side ?? r?.side;
        const row = document.createElement("div");
        row.className = "table-row";
        const badge = document.createElement("span");
        badge.className = "table-badge";
        badge.textContent = shownSide ?? "\u2014";
        const info = document.createElement("div");
        info.className = "table-info";
        const title = document.createElement("strong");
        title.textContent = c.gameInfo.tableName || String(c.tableId);
        const meta3 = document.createElement("small");
        meta3.textContent = `\u9774 ${c.gameInfo.shoeId ?? "\u2014"} \xB7 \u5C40 ${c.gameInfo.playId ?? "\u2014"} \xB7 ${getPatternInfo(results).label}`;
        info.append(title, meta3);
        const amount = document.createElement("div");
        amount.className = "table-rec";
        amount.textContent = money(ownPending?.amount ?? stakeAmount(String(c.tableId), previewBase, previewScope));
        const detail = document.createElement("small");
        const limitCheck = checkDgAmount(c, stakeAmount(String(c.tableId), previewBase, previewScope));
        detail.textContent = ownPending ? `${ownPending.state === "accepted" ? "\u5E73\u53F0\u5DF2\u63A5\u53D7 \xB7 \u5F85\u7D50\u7B97" : ownPending.state === "uncertain" ? "\u56DE\u8986\u672A\u78BA\u5B9A" : "\u5DF2\u9001\u51FA \xB7 \u5F85\u63A5\u53D7"} ${money(ownPending.amount)}` : !limitCheck.ok ? limitCheck.reason : tableWait.get(String(c.tableId)) ?? (r.side ? `\u6307\u6A19 ${r.confidence} \xB7 ${Math.floor(remaining(c))}s` : r.reason || "\u7B49\u5F85\u8CC7\u6599");
        detail.style.maxWidth = "120px";
        detail.style.whiteSpace = "normal";
        detail.title = limitCheck.reason;
        amount.append(detail);
        row.append(badge, info, amount);
        q("tables").append(row);
        const chip = document.createElement("button");
        chip.className = "table-chip" + (focus === c ? " selected" : "");
        const chipTitle = document.createElement("strong");
        chipTitle.textContent = `${c.gameInfo.tableName || c.tableId} \xB7 ${shownSide ?? "\u2014"} ${money(ownPending?.amount ?? stakeAmount(String(c.tableId), previewBase, previewScope))}`;
        const roundState = currentRoundState(c);
        const chipStatus = document.createElement("small");
        chipStatus.textContent = roundState.label;
        chipStatus.title = roundState.label;
        chipStatus.classList.toggle("green", roundState.ok);
        chipTitle.title = ownPending ? `\u539F\u55AE ${ownPending.side} ${money(ownPending.amount)}\uFF0C${ownPending.staking === "flat" ? "\u5E73\u6CE8" : `\u7B2C${ownPending.level + 1}\u968E`}` : `\u4E0B\u4E00\u6CE8\u9810\u89BD\uFF1A\u57FA\u672C ${money(previewBase)}\uFF0C${stakingMode() === "flat" ? "\u5E73\u6CE8" : `\u7B2C${amountLevel(String(c.tableId), previewScope) + 1}\u968E`}`;
        chip.append(chipTitle, chipStatus);
        chip.onclick = () => showPage("logs");
        q("table-strip").append(chip);
      }
      if (!chosen.length) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = manualSelection ? "\u7B49\u5F85\u6307\u5B9A\u684C\u53F0\u958B\u653E\u4E0B\u6CE8" : "\u81EA\u52D5\u627E\u684C\u4E2D \xB7 \u6709\u53EF\u4E0B\u6CE8\u684C\u5C31\u52A0\u5165";
        q("tables").append(empty);
      }
      q("compact-stop").classList.toggle("live", running);
      q("compact-stop").textContent = running ? "\u25A0 \u505C\u6B62\u81EA\u52D5\u4E0B\u6CE8" : "\u25B6 \u958B\u59CB\u81EA\u52D5\u4E0B\u6CE8";
      if (!q("report-shell").hidden) renderReport();
      fitPanel();
    }
    q("scan").onclick = scan;
    q("count").onchange = () => selectCount(q("count").value);
    q("parallel-count").onchange = () => selectCount(q("parallel-count").value);
    function requestStart(testOnce = false) {
      if (running || busy) return;
      riskApproved = false;
      riskTestOnce = testOnce;
      riskReturnFocus = shadow.activeElement;
      q("risk-record-state").textContent = "";
      q("risk-doubling-warning").hidden = stakingMode() !== "doubling";
      q("risk-doubling-warning").textContent = `\u4F7F\u7528\u500D\u6295\u6CD5\uFF0C\u8ACB\u8A2D\u5B9A\u6B62\u76C8\u8207\u6B62\u640D\u3002${!q("take-profit").value || !q("stop-loss").value ? "\u76EE\u524D\u6B62\u76C8\uFF0F\u6B62\u640D\u5C1A\u672A\u5168\u90E8\u8A2D\u5B9A\uFF0C\u8ACB\u5148\u81F3\u8A2D\u5B9A\u9801\u78BA\u8A8D\u3002" : "\u8ACB\u78BA\u8A8D\u76EE\u524D\u6B62\u76C8\u8207\u6B62\u640D\u91D1\u984D\u7B26\u5408\u4F60\u7684\u8A2D\u5B9A\u3002"}`;
      q("risk-time-summary").textContent = (() => {
        try {
          const n = parseDurationMinutes(q("duration-minutes").value);
          return n ? `\u81EA\u52D5\u505C\u6B62\uFF1A${n} \u5206\u9418\uFF0C\u78BA\u8A8D\u958B\u59CB\u5F8C\u8A08\u6642` : "\u81EA\u52D5\u505C\u6B62\uFF1A\u4E0D\u9650\u6642\uFF1B\u78BA\u8A8D\u958B\u59CB\u5F8C\u986F\u793A\u672C\u6B21\u4F7F\u7528\u6642\u9593";
        } catch (e) {
          return e.message;
        }
      })();
      q("risk-stake-summary").textContent = `${startMode === "fresh" ? "\u65B0\u958B\u59CB\uFF1A\u9996\u7B46\u57FA\u672C\u984D" : "\u7E8C\u63A5\uFF1A\u6CBF\u7528\u914D\u6CE8\u968E\u7D1A"} \xB7 \u57FA\u672C ${q("base").value} \xB7 ${stakingMode() === "flat" ? "\u5E73\u6CE8" : stakingMode() === "doubling" ? "\u500D\u6295 1\u21922\u21924\u21928" : `\u99AC\u4E01 1\u21923\u21927\u219215`}`;
      q("ack").checked = false;
      q("risk-confirm").disabled = true;
      q("risk-dialog").hidden = false;
      fitPanel();
      q("ack").focus();
    }
    function cancelRisk() {
      q("risk-dialog").hidden = true;
      riskApproved = false;
      fitPanel();
      riskReturnFocus?.focus();
    }
    q("ack").onchange = () => {
      q("risk-confirm").disabled = !q("ack").checked;
      if (!q("ack").checked) q("risk-record-state").textContent = "\u5DF2\u53D6\u6D88\u52FE\u9078\uFF1B\u5148\u524D\u5DF2\u8A18\u9304\u7684\u52FE\u9078\u4E0D\u6703\u62B9\u9664";
      else if (q("ack").dataset.autobacRiskRecording !== "connected") q("risk-record-state").textContent = "\u672A\u9023\u63A5\u7DB2\u7AD9\u7D00\u9304\u670D\u52D9\uFF0C\u52FE\u9078\u5C1A\u672A\u540C\u6B65\u81F3\u5F8C\u53F0";
    };
    q("risk-cancel").onclick = cancelRisk;
    q("risk-confirm").onclick = () => {
      if (!q("ack").checked) return;
      riskApproved = true;
      q("risk-dialog").hidden = true;
      start(riskTestOnce);
      if (running) showPage("overview");
    };
    q("risk-dialog").onkeydown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelRisk();
      }
      if (e.key === "Tab") {
        const targets = [q("ack"), q("risk-cancel"), ...!q("risk-confirm").disabled ? [q("risk-confirm")] : []];
        const at = targets.indexOf(shadow.activeElement);
        e.preventDefault();
        targets[(at + (e.shiftKey ? -1 : 1) + targets.length) % targets.length].focus();
      }
    };
    q("start").onclick = () => requestStart();
    q("once").onclick = () => requestStart(true);
    q("stop").onclick = () => stop();
    q("stop-now").onclick = () => {
      if (running) stop();
      else requestStart();
    };
    q("nav-overview").onclick = () => showPage("overview");
    q("nav-settings").onclick = () => showPage("settings");
    q("nav-logs").onclick = () => showPage("logs");
    q("edit-rooms").onclick = () => showRooms();
    function showRooms() {
      renderRooms();
      q("rooms-hint").textContent = selectionLocked() ? "\u5F85\u4E0B\u6CE8\u5B8C\u6210\u7D50\u7B97\u5F8C\u624D\u80FD\u6539\u9078\u3002" : `\u76EE\u524D\u9078 ${selected.size} \u684C\uFF1B\u53D6\u6D88\u4E00\u684C\u5F8C\u53EF\u66F4\u63DB\u3002`;
      showPage("rooms");
    }
    q("auto-tables").onclick = () => {
      if (selectionLocked()) return;
      manualSelection = false;
      selected.clear();
      scan();
      render();
    };
    q("choose-tables").onclick = showRooms;
    q("rooms-back").onclick = () => showPage("overview");
    q("hero-status").onclick = () => showPage("logs");
    q("hero-status").onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showPage("logs");
      }
    };
    q("single-staking").onchange = () => {
      if (roomCount !== "1" || selectionLocked()) {
        q("single-staking").value = stakingMode();
        return;
      }
      const value = q("single-staking").value;
      if (value !== "flat" && value !== "martingale" && value !== "doubling") return;
      singleStaking = value;
      scope = desiredScope();
      syncRiskInputMode();
      render();
    };
    function setZoom(value) {
      userZoom = Math.max(0.7, Math.min(1.8, value));
      q("zoom").value = String(Math.round(userZoom * 100));
      fitPanel();
    }
    q("duration-minutes").oninput = render;
    q("zoom").oninput = () => setZoom(Number(q("zoom").value) / 100);
    function setMini(value) {
      if (value === mini) return;
      if (value) {
        miniPreviousCompact = compact;
        compact = true;
      } else compact = miniPreviousCompact;
      mini = value;
      q("panel").classList.toggle("mini", mini);
      q("panel").classList.toggle("compact", compact);
      q("zoom-out").setAttribute("aria-label", mini ? "\u5C55\u958B\u5B8C\u6574\u9762\u677F" : "\u5207\u63DB\u8FF7\u4F60\u9762\u677F");
      q("zoom-out").title = mini ? "\u5C55\u958B\u5B8C\u6574\u9762\u677F" : "\u5207\u63DB\u8FF7\u4F60\u9762\u677F";
      q("mini-label").textContent = mini ? "\u5C55\u958B" : "\u8FF7\u4F60";
      q("zoom-out").querySelector("path").setAttribute("d", mini ? "M5 9V5h4 M15 5h4v4 M19 15v4h-4 M9 19H5v-4" : "M5 12h14");
      if (mini) showPage("overview");
      render();
    }
    q("zoom-in").onclick = () => {
      if (mini) setMini(false);
      else setZoom(userZoom + 0.1);
    };
    q("zoom-out").onclick = () => setMini(!mini);
    for (const id of ["base", "cap", "scope", "range-min", "range-max"]) q(id).oninput = render;
    q("start-mode").onchange = () => {
      if (selectionLocked()) {
        q("start-mode").value = startMode;
        return;
      }
      startMode = q("start-mode").value;
      render();
    };
    q("provider").oninput = q("provider").onchange = () => {
      if (selectionLocked()) {
        q("provider").value = provider;
        providerMenu.sync();
        return;
      }
      provider = q("provider").value;
      render();
    };
    q("hide").onclick = () => setMini(true);
    q("hide").title = "\u5207\u63DB\u8FF7\u4F60\u9762\u677F";
    q("hide").setAttribute("aria-label", "\u5207\u63DB\u8FF7\u4F60\u9762\u677F");
    function openReport() {
      q("report-shell").hidden = false;
      renderReport();
      fitPanel();
    }
    function renderUsageReport() {
      const all = usageHistory.view();
      const records = usageHistoryInPeriod(all, reportPeriod);
      const perPage = 6, pages = Math.max(1, Math.ceil(records.length / perPage));
      reportPage = Math.max(0, Math.min(reportPage, pages - 1));
      const previous2 = all.find((r) => r.state !== "active");
      const fmt = (at) => new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(at);
      q("report-body").replaceChildren();
      for (const r of records.slice(reportPage * perPage, (reportPage + 1) * perPage)) {
        const row = document.createElement("article");
        row.className = "report-card";
        row.dataset.usageId = r.id;
        const head2 = document.createElement("div");
        head2.className = "report-card-head";
        const title = document.createElement("strong");
        title.textContent = r.state === "active" ? "\u672C\u6B21\u4F7F\u7528" : r.id === previous2?.id ? "\u4E0A\u6B21\u4F7F\u7528" : "\u4F7F\u7528\u7D00\u9304";
        const state = document.createElement("span");
        state.className = "report-state";
        state.textContent = (r.state === "active" ? "\u57F7\u884C\u4E2D" : r.state === "interrupted" ? "\u9801\u9762\u4E2D\u65B7" : "\u5DF2\u505C\u6B62") + (r.pendingCount ? ` \xB7 \u5F85\u7D50\u7B97 ${r.pendingCount}` : "") + (r.uncertainCount ? ` \xB7 \u672A\u78BA\u5B9A ${r.uncertainCount}` : "");
        head2.append(title, state);
        const values = document.createElement("div");
        values.className = "report-values";
        const used = document.createElement("span");
        used.textContent = `\u4F7F\u7528 ${r.elapsedText}`;
        const result = document.createElement("strong");
        result.textContent = `\u5DF2\u7D50\u7B97\u8F38\u8D0F ${r.pnl > 0 ? "+" : ""}${money(r.pnl)}`;
        if (r.pnl) result.className = r.pnl > 0 ? "green" : "red";
        values.append(used, result);
        const time3 = document.createElement("div");
        time3.className = "report-card-time";
        time3.textContent = `\u958B\u59CB ${fmt(r.createdAt)} \xB7 ${r.endedAt === null ? "\u5C1A\u672A\u505C\u6B62" : "\u505C\u6B62 " + fmt(r.endedAt)} \xB7 \u8D0F/\u8F38 ${r.wins}/${r.losses}`;
        row.append(head2, values, time3);
        q("report-body").append(row);
      }
      q("report-empty").hidden = records.length > 0;
      q("report-empty").textContent = "\u5C1A\u7121\u4F7F\u7528\u7D00\u9304\uFF1B\u78BA\u8A8D\u958B\u59CB\u5F8C\u5EFA\u7ACB\u65B0\u7684\u4E00\u6B21";
      q("report-note").textContent = "\u6BCF\u6B21\u4F7F\u7528\u6642\u9593\u8207\u5DF2\u7D50\u7B97\u8F38\u8D0F\uFF1B\u5F85\u7D50\u7B97\u56DE\u586B\u539F\u6B21\uFF0C\u4E0D\u8A08\u5165\u4E0B\u4E00\u6B21";
      q("report-total").textContent = `${records.length} \u6B21 \xB7 \u5DF2\u7D50\u7B97\u8F38\u8D0F ${money(records.reduce((sum, r) => sum + r.pnl, 0))}`;
      q("report-page").textContent = `${reportPage + 1} / ${pages}`;
    }
    function renderReport() {
      q("report-usage").classList.toggle("selected", reportTab === "usage");
      q("report-bets").classList.toggle("selected", reportTab === "bets");
      q("report-transactions").classList.toggle("selected", reportTab === "transactions");
      for (const period of ["today", "yesterday", "week"]) q("report-" + period).classList.toggle("selected", period === reportPeriod);
      if (reportTab === "usage") {
        renderUsageReport();
        return;
      }
      const perPage = 6;
      const records = reportTab === "bets" ? periodBets(ledger.state.bets, reportPeriod).slice().reverse() : [];
      const pages = Math.max(1, Math.ceil(records.length / perPage));
      reportPage = Math.max(0, Math.min(reportPage, pages - 1));
      q("report-body").replaceChildren();
      const fmtTime = (at) => new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(at);
      for (const [i, b] of records.slice(reportPage * perPage, (reportPage + 1) * perPage).entries()) {
        const card = boards().find((c) => String(c.tableId) === b.tableId);
        const labels = { reserved: "\u6E96\u5099\u4E2D", submitted: "\u5F85\u63A5\u53D7", accepted: "\u5F85\u7D50\u7B97", rejected: "\u62D2\u7D55", uncertain: "\u672A\u78BA\u5B9A", settled: "\u5DF2\u7D50\u7B97", aborted: "\u672A\u9001\u51FA" };
        const row = document.createElement("article");
        row.className = "report-card";
        const head2 = document.createElement("div");
        head2.className = "report-card-head";
        const title = document.createElement("strong");
        title.textContent = `${card?.gameInfo.tableName ?? b.tableId} \xB7 ${b.side}`;
        const state = document.createElement("span");
        state.className = "report-state";
        state.textContent = labels[b.state];
        head2.append(title, state);
        const values = document.createElement("div");
        values.className = "report-values";
        const stake = document.createElement("span");
        stake.textContent = `\u4E0B\u6CE8 ${money(b.amount)}`;
        const result = document.createElement("strong");
        result.textContent = b.pnl == null ? "\u640D\u76CA\u5F85\u5B9A" : `\u640D\u76CA ${b.pnl > 0 ? "+" : ""}${money(b.pnl)}`;
        if (b.pnl) result.className = b.pnl > 0 ? "green" : "red";
        values.append(stake, result);
        const time3 = document.createElement("div");
        time3.className = "report-card-time";
        time3.textContent = `\u4E0B\u6CE8 ${fmtTime(b.createdAt)}`;
        row.append(head2, values, time3);
        q("report-body").append(row);
      }
      q("report-empty").hidden = records.length > 0;
      q("report-empty").textContent = reportTab === "transactions" ? "\u5C1A\u672A\u63A5\u5165\u5E73\u53F0\u5B58\u63D0\uFF0F\u8F49\u5E33\u8CC7\u6599\uFF0C\u4E0D\u6703\u7528\u4E0B\u6CE8\u7D00\u9304\u5192\u5145\u4EA4\u6613\u8A18\u9304" : "\u6B64\u671F\u9593\u5C1A\u7121\u4E0B\u6CE8\u8A18\u9304";
      q("report-note").textContent = "\u672C\u5DE5\u5177\u8A18\u9304\u7684\u4E0B\u6CE8\u8207\u7D50\u679C";
      q("report-total").textContent = `${records.length} \u7B46 \xB7 \u4E0B\u6CE8 ${money(records.reduce((a, b) => a + b.amount, 0))} \xB7 \u5DF2\u7D50\u7B97\u640D\u76CA ${money(records.reduce((a, b) => a + (b.pnl ?? 0), 0))}`;
      q("report-page").textContent = `${reportPage + 1} / ${pages}`;
      q("report-bets").classList.toggle("selected", reportTab === "bets");
      q("report-transactions").classList.toggle("selected", reportTab === "transactions");
      for (const period of ["today", "yesterday", "week"]) q("report-" + period).classList.toggle("selected", period === reportPeriod);
    }
    q("nav-mode").onclick = () => {
      compact = !compact;
      q("panel").classList.toggle("compact", compact);
      q("brand-count").textContent = "\u767E\u5BB6\u5DE5\u7A0B\u5E2B";
      showPage("overview");
      render();
    };
    q("official-refresh").onclick = () => official.refresh(true);
    q("open-records").onclick = q("open-report").onclick = openReport;
    q("last-usage").onclick = () => {
      reportTab = "usage";
      reportPage = 0;
      openReport();
    };
    q("compact-stop").onclick = () => q("stop-now").click();
    q("close-report").onclick = () => {
      q("report-shell").hidden = true;
      showPage("overview");
    };
    for (const period of ["today", "yesterday", "week"]) q("report-" + period).onclick = () => {
      reportPeriod = period;
      reportPage = 0;
      renderReport();
    };
    q("report-usage").onclick = () => {
      reportTab = "usage";
      reportPage = 0;
      renderReport();
    };
    q("report-bets").onclick = () => {
      reportTab = "bets";
      reportPage = 0;
      renderReport();
    };
    q("report-transactions").onclick = () => {
      reportTab = "transactions";
      reportPage = 0;
      renderReport();
    };
    q("report-prev").onclick = () => {
      reportPage--;
      renderReport();
    };
    q("report-next").onclick = () => {
      reportPage++;
      renderReport();
    };
    q("report-lobby").onchange = q("report-game").onchange = () => {
      reportPage = 0;
      renderReport();
    };
    let drag = null;
    const head = q("head");
    head.onpointerdown = (e) => {
      if (e.target.closest("button,input,select")) return;
      const box = host.getBoundingClientRect();
      drag = { x: e.clientX, y: e.clientY, left: box.left, top: box.top };
      head.setPointerCapture?.(e.pointerId);
    };
    head.onpointermove = (e) => {
      if (!drag) return;
      const fit = parseFloat(host.style.getPropertyValue("--fit")) || 1;
      const left = Math.max(0, Math.min(window.innerWidth - (mini ? 210 : panelWidth) * fit, drag.left + e.clientX - drag.x));
      const top = Math.max(0, Math.min(window.innerHeight - 50, drag.top + e.clientY - drag.y));
      host.style.left = left + "px";
      host.style.top = top + "px";
      host.style.right = "auto";
      for (const id of ["panel", "risk-dialog", "report-shell"]) {
        q(id).style.transformOrigin = "top left";
        if (id !== "panel") {
          q(id).style.left = "0";
          q(id).style.right = "auto";
        }
      }
    };
    head.onpointerup = head.onpointercancel = head.onlostpointercapture = () => {
      drag = null;
    };
    const cleanupResize = installDgPanelResize([q("resize-panel"), q("resize-report")], {
      getSize: () => ({ width: panelWidth, height: Math.min(panelHeight, parseFloat(host.style.getPropertyValue("--full-height")) || panelHeight), scale: parseFloat(host.style.getPropertyValue("--fit")) || 1 }),
      prepare: (target) => {
        const box = target.getBoundingClientRect();
        host.style.left = box.left + "px";
        host.style.top = box.top + "px";
        host.style.right = "auto";
        for (const id of ["panel", "risk-dialog", "report-shell"]) {
          q(id).style.transformOrigin = "top left";
          if (id !== "panel") {
            q(id).style.left = "0";
            q(id).style.right = "auto";
          }
        }
      },
      apply: (width, height) => {
        panelWidth = Math.round(width);
        panelHeight = Math.round(height);
        fitPanel();
      }
    });
    window.addEventListener("resize", fitPanel);
    fitPanel();
    function visibility() {
      if (document.hidden) stop("\u9801\u9762\u9032\u5165\u80CC\u666F\uFF0C\u5DF2\u505C\u6B62\u65B0\u589E\u64CD\u4F5C\uFF1B\u8FD4\u56DE\u5F8C\u9700\u624B\u52D5\u958B\u59CB");
    }
    document.addEventListener("visibilitychange", visibility);
    function settingsSync(event) {
      const detail = event.detail;
      if (!detail || detail.eventId !== runEventId || !["synced", "failed"].includes(detail.state)) return;
      settingsSyncState = detail.state;
      logs.unshift(`${(/* @__PURE__ */ new Date()).toLocaleTimeString("zh-TW", { hour12: false })} ${detail.state === "synced" ? "\u672C\u6B21\u4F7F\u7528\u8A2D\u5B9A\u5DF2\u8A18\u9304\u81F3\u7BA1\u7406\u5F8C\u53F0" : "\u672C\u6B21\u8A2D\u5B9A\u5C1A\u672A\u540C\u6B65\u81F3\u5F8C\u53F0\uFF0C\u57F7\u884C\u8A2D\u5B9A\u4E0D\u53D7\u5F71\u97FF"}`);
      logs.length = Math.min(logs.length, 50);
      render();
    }
    window.addEventListener(DG_SETTINGS_SYNC_EVENT, settingsSync);
    const timer = setInterval(() => void tick(), 500);
    window.__DG_SINGLEPAGE__ = {
      version: "3.2.2-mobile-v329-native",
      start: () => requestStart(),
      stop,
      scan,
      flushUsageKeepalive: () => {
        if (running && runEventId) {
          usageHistory.updateElapsed(sessionTimer.view().elapsedMs);
          persistUsage();
          reportUsage(runEventId, true, true);
        }
      },
      usageHistory: () => usageHistory.view(),
      settingsSnapshot: () => activeSettings ? JSON.parse(JSON.stringify(activeSettings)) : null,
      stakeDiagnostics,
      officialTurnover: official.view,
      refreshOfficialTurnover: () => official.refresh(true),
      mobileDiagnostics: () => inspectDgMobileNativeSurface(window),
      runtimeDiagnostics: () => describeDgScene(nodes()),
      exportMobilePublicSources: () => exportDgMobileLoadedPublicScripts(document),
      status: () => ({ running, status, settingsSyncState, usage: sessionTimer.view(), mini, base, startMode, selectionMode: manualSelection ? "manual" : "auto", panelSize: { width: panelWidth, height: panelHeight }, pending: ledger.pending().map((b) => ({ ...b })), selected: [...selected], roomCount, scope, staking: stakingMode(), riskLimits: { ...riskLimits }, roundPnl: roundPnl(), unacknowledgedFunds: unacknowledgedFunds() }),
      rounds: () => boards().filter((c) => selected.has(String(c.tableId))).map((c) => ({ table: c.gameInfo.tableName, round: c.gameInfo.playId, ...currentRoundState(c) })),
      diagnostics: () => boards().map((c) => ({ table: c.gameInfo?.tableName || String(c.tableId), tableId: String(c.tableId), selected: selected.has(String(c.tableId)), round: c.gameInfo?.playId, gameState: c.gameInfo?.stateId, countdown: Math.floor(remaining(c)), ready: ready(c), ...checkDgAmount(c, stakeAmount(String(c.tableId))) })),
      exportLedger: () => JSON.parse(JSON.stringify(ledger.state)),
      analysis: (tableId) => {
        const c = boards().find((n) => String(n.tableId) === String(tableId));
        return c ? provider === "counting" || provider === "parity" ? strategyFor(c).reason || "\u7B49\u5F85\u5BE6\u969B\u724C\u5F35" : providerAnalysisText(provider, { results: roads(c) }) : "\u672A\u627E\u5230\u684C\u53F0";
      },
      dispose: () => {
        if (running && runEventId) {
          usageHistory.updateElapsed(sessionTimer.view().elapsedMs);
          persistUsage();
          reportUsage(runEventId, true, true);
        }
        running = false;
        disposed = true;
        epoch++;
        clearInterval(timer);
        official.dispose();
        cleanupFeedback();
        cleanupTouchScroll();
        cleanupResize();
        providerMenu.cleanup();
        socket?.off("RECEIVED_SUCCESS", owner, onMessage);
        if (socket?.sendData === sendObserver) socket.sendData = originalSend;
        document.removeEventListener("visibilitychange", visibility);
        window.removeEventListener("resize", fitPanel);
        window.removeEventListener(DG_SETTINGS_SYNC_EVENT, settingsSync);
        persist();
        host.remove();
      }
    };
    attach(nodes());
    scan();
    showPage("overview");
    official.refresh();
    render();
  })();
})();
