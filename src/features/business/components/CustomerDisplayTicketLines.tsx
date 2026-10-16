import React from 'react';
import { View } from 'react-native';
import { BusinessTotalsRow } from '@features/business/components/BusinessPosPrimitives';
import type { TotalsRow } from '@features/business/utils/posMappers';

/** The ticket lines and totals as the customer sees them on the display. */
export function CustomerDisplayTicketLines({
  lines,
  totals,
}: {
  lines: { id: string; label: string; value: string }[];
  totals: TotalsRow[];
}) {
  return (
    <View className="gap-1.5">
      {lines.map(line => (
        <BusinessTotalsRow key={line.id} label={line.label} value={line.value} />
      ))}
      <View className="mt-1 gap-1.5 border-t border-border pt-2">
        {totals.map(row => (
          <BusinessTotalsRow
            key={row.id}
            label={row.label}
            value={row.value}
            tone={row.tone}
          />
        ))}
      </View>
    </View>
  );
}
