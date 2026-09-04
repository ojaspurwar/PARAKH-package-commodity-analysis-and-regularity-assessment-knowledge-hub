import React from 'react';
import { ArrowUpRight, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import type { Scan } from '@workspace/api-client-react';
import { StatusPill } from '@/components/scan-ui';
import { useI18n } from '@/lib/i18n';

export interface ScanTableProps {
  scans: Scan[];
  onDelete?: (e: React.MouseEvent, scan: Scan) => void;
  showCategory?: boolean;
  showLocation?: boolean;
  showOfficer?: boolean;
}

export function ScanTable({
  scans,
  onDelete,
  showCategory = true,
  showLocation = true,
  showOfficer = false,
}: ScanTableProps) {
  const { language, t } = useI18n();

  return (
    <div className="w-full overflow-x-auto rounded-[var(--r-md)] border border-[var(--border)] bg-white" data-testid="scan-data-table-container">
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-[var(--bg-sunken)] text-[var(--text-muted)] border-b border-[var(--border)] select-none">
          <tr className="h-10">
            <th className="px-4 py-2 font-semibold">
              {language === 'hi' ? 'संदर्भ कोड' : 'Record ID'}
            </th>
            <th className="px-4 py-2 font-semibold">
              {language === 'hi' ? 'कमोडिटी का नाम' : 'Commodity & Name'}
            </th>
            {showCategory && (
              <th className="px-4 py-2 font-semibold hidden md:table-cell">
                {language === 'hi' ? 'श्रेणी' : 'Category'}
              </th>
            )}
            {showLocation && (
              <th className="px-4 py-2 font-semibold hidden lg:table-cell">
                {language === 'hi' ? 'स्थान' : 'Location'}
              </th>
            )}
            {showOfficer && (
              <th className="px-4 py-2 font-semibold hidden xl:table-cell">
                {language === 'hi' ? 'अधिकारी' : 'Officer'}
              </th>
            )}
            <th className="px-4 py-2 font-semibold text-right">
              {language === 'hi' ? 'दिनांक एवं समय' : 'Timestamp'}
            </th>
            <th className="px-4 py-2 font-semibold text-center">
              {language === 'hi' ? 'स्थिति' : 'Status'}
            </th>
            <th className="px-4 py-2 font-semibold text-right">
              {language === 'hi' ? 'कार्रवाई' : 'Action'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {scans.map((scan) => {
            const dateStr = typeof scan.capturedAt === 'string'
              ? scan.capturedAt.replace('T', ' ').slice(0, 16)
              : new Date(scan.capturedAt).toISOString().replace('T', ' ').slice(0, 16);

            return (
              <tr
                key={scan.id}
                className="h-10 transition-colors hover:bg-[var(--indigo-050)]"
                data-testid={`table-row-scan-${scan.id}`}
              >
                {/* Record ID in mono tabular-nums */}
                <td className="px-4 py-2 font-mono font-semibold text-[var(--text)] tabular-nums whitespace-nowrap">
                  <Link
                    href={`/scans/${scan.id}`}
                    className="hover:underline text-[var(--link)] hover:text-[var(--link-hover)]"
                  >
                    {scan.reference}
                  </Link>
                </td>

                {/* Commodity Name & Barcode */}
                <td className="px-4 py-2 font-medium text-[var(--text)] max-w-xs truncate">
                  <div className="truncate font-semibold">{scan.productName}</div>
                  {scan.barcode && (
                    <div className="font-mono text-[10px] text-[var(--text-muted)] tabular-nums">
                      EAN: {scan.barcode}
                    </div>
                  )}
                </td>

                {/* Category */}
                {showCategory && (
                  <td className="px-4 py-2 text-[var(--text-muted)] hidden md:table-cell whitespace-nowrap">
                    {scan.category}
                  </td>
                )}

                {/* Location */}
                {showLocation && (
                  <td className="px-4 py-2 text-[var(--text-muted)] hidden lg:table-cell max-w-[180px] truncate">
                    {scan.location}
                  </td>
                )}

                {/* Officer */}
                {showOfficer && (
                  <td className="px-4 py-2 text-[var(--text-muted)] hidden xl:table-cell whitespace-nowrap">
                    {scan.officerName}
                  </td>
                )}

                {/* Timestamp in mono tabular-nums */}
                <td className="px-4 py-2 font-mono text-[11px] text-[var(--text-muted)] tabular-nums text-right whitespace-nowrap">
                  {dateStr}
                </td>

                {/* Status Badge */}
                <td className="px-4 py-2 text-center whitespace-nowrap">
                  <StatusPill status={scan.status} submitted={scan.submitted} />
                </td>

                {/* Action Link & Delete */}
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    <Link
                      href={`/scans/${scan.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--link)] hover:text-[var(--link-hover)]"
                      data-testid={`link-inspect-scan-${scan.id}`}
                    >
                      <span>{language === 'hi' ? 'समीक्षा' : 'Review'}</span>
                      <ExternalLink size={12} className="shrink-0" />
                    </Link>
                    {onDelete && (
                      <button
                        type="button"
                        onClick={(e) => onDelete(e, scan)}
                        className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--rose-ac)] hover:bg-[var(--rose-t)] transition-colors"
                        title={language === 'hi' ? 'हटाएं' : 'Delete'}
                        aria-label="Delete scan record"
                        data-testid={`button-delete-row-${scan.id}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
