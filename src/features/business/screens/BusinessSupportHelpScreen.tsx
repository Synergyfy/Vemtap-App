import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { EmptyState, ErrorState, LoadingState } from '@components/shared';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessScreenLayout,
  BusinessSelectionChip,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import { FieldInput } from '@features/business/components/BusinessSetupPrimitives';
import type { CreateTicketInput, TicketPriority } from '@api/supportApi';
import type {
  KbArticleView,
  SupportTreeView,
  TicketRowView,
  TicketThreadView,
} from '@features/business/utils/supportMappers';

cssInterop(Pressable, { className: 'style' });

const copy = strings.businessSupportHelp;

/** The assistant answers from the knowledge base, so its source is worth showing. */
const botSourceLabel: Record<string, string> = {
  knowledge_base: copy.botSourceKnowledge,
  ai: copy.botSourceAi,
  fallback: copy.botSourceFallback,
};

export interface BotAnswerView {
  body: string;
  source: string;
}

export interface BusinessSupportHelpScreenProps {
  /** Knowledge tree; while undefined the screen shows loading or the error. */
  tree?: SupportTreeView;
  tickets?: TicketRowView[];
  /** The open ticket's thread, rendered in the reply sheet. */
  thread?: TicketThreadView | null;
  threadLoading?: boolean;
  botAnswer?: BotAnswerView | null;
  botPending?: boolean;
  botFailed?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
  /** Filtering the tree is the route's query, so the search box reports upward. */
  onSearch?: (search: string) => void;
  onAskBot?: (query: string) => void;
  onCreateTicket?: (input: CreateTicketInput) => void;
  onReply?: (ticketId: string, message: string) => void;
  onOpenTicket?: (ticketId: string) => void;
  onCloseThread?: () => void;
}

/**
 * Support & help: ask the assistant, search the live knowledge base, and raise or
 * follow a support ticket. Everything on screen comes from `/support/*` or
 * `/knowledge-base`; the screen only owns which article is expanded and what is
 * currently being typed.
 */
export function BusinessSupportHelpScreen({
  tree,
  tickets,
  thread,
  threadLoading,
  botAnswer,
  botPending,
  botFailed,
  isLoading,
  isError,
  onRetry,
  onBack,
  onSearch,
  onAskBot,
  onCreateTicket,
  onReply,
  onOpenTicket,
  onCloseThread,
}: BusinessSupportHelpScreenProps) {
  const [search, setSearch] = useState('');
  const [question, setQuestion] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [openArticles, setOpenArticles] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [reply, setReply] = useState('');
  const [form, setForm] = useState({
    subject: '',
    category: '',
    message: '',
    priority: 'Normal' as TicketPriority,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const toggle = (list: string[], id: string, set: (next: string[]) => void) =>
    set(list.includes(id) ? list.filter(item => item !== id) : [...list, id]);

  const submitQuestion = () => {
    const query = question.trim();
    if (!query) return;
    onAskBot?.(query);
  };

  const submitTicket = () => {
    const subject = form.subject.trim();
    const category = form.category.trim();
    const message = form.message.trim();

    if (!subject) return setFormError(copy.errors.subject);
    if (!category) return setFormError(copy.errors.category);
    if (!message) return setFormError(copy.errors.message);

    onCreateTicket?.({
      subject,
      category,
      message,
      priority: form.priority,
    });
    setFormError(null);
    setFormOpen(false);
    setForm({ subject: '', category: '', message: '', priority: 'Normal' });
  };

  const submitReply = () => {
    const message = reply.trim();
    if (!message || !thread) return;
    onReply?.(thread.id, message);
    setReply('');
  };

  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        <View className="pb-2">
          <Button
            label={copy.newTicketCta}
            labelVariant="labelMd"
            onPress={() => setFormOpen(true)}
            leftIcon={<Icon name="plus" size={18} color={colors.surface} />}
          />
        </View>
      }
    >
      {!tree ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={isLoading ? copy.loading : undefined} />
        )
      ) : (
        <>
          <BusinessPanel
            className="mt-1"
            title={copy.botTitle}
            subtitle={copy.botBody}
            icon="support"
          >
            <View className="gap-2">
              <FieldInput
                label={copy.botPlaceholder}
                value={question}
                onChangeText={setQuestion}
                placeholder={copy.botPlaceholder}
                accessibilityLabel={copy.botTitle}
              />
              <Button
                label={copy.botAsk}
                labelVariant="labelSm"
                size="sm"
                fullWidth={false}
                onPress={submitQuestion}
              />
              {botPending ? (
                <VemtapText variant="caption" tone="secondary">
                  {copy.loading}
                </VemtapText>
              ) : null}
              {botFailed ? (
                <VemtapText accessibilityRole="alert" variant="caption" tone="error">
                  {copy.botError}
                </VemtapText>
              ) : null}
              {botAnswer ? (
                <View className="gap-1 rounded-field bg-surface-subtle p-2.5">
                  <View className="flex-row items-center gap-1.5">
                    <Icon name="support" size={13} color={colors.primary} />
                    <VemtapText
                      variant="micro"
                      className="font-sans-bold text-primary"
                      numberOfLines={1}
                    >
                      {botSourceLabel[botAnswer.source] ?? copy.botSourceFallback}
                    </VemtapText>
                  </View>
                  <VemtapText variant="bodyMd" className="leading-snug">
                    {botAnswer.body}
                  </VemtapText>
                </View>
              ) : null}
            </View>
          </BusinessPanel>

          <View className="mt-3 gap-2">
            <FieldInput
              label={copy.searchLabel}
              value={search}
              onChangeText={setSearch}
              placeholder={copy.searchPlaceholder}
              accessibilityLabel={copy.searchLabel}
            />
            <Button
              label={copy.searchCta}
              labelVariant="labelSm"
              size="sm"
              fullWidth={false}
              onPress={() => onSearch?.(search.trim())}
            />
          </View>

          <BusinessPanel
            className="mt-3"
            title={copy.knowledgeTitle}
            icon="folderStar"
            badge={tree.totalLabel}
            badgeTone="neutral"
          >
            {tree.categories.length ? (
              <View className="gap-2">
                {tree.categories.map(category => {
                  const open = openCategories.includes(category.id);
                  return (
                    <View
                      key={category.id}
                      className="overflow-hidden rounded-field bg-surface-subtle"
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ expanded: open }}
                        accessibilityLabel={category.title}
                        onPress={() =>
                          toggle(openCategories, category.id, setOpenCategories)
                        }
                        className="flex-row items-center gap-3 p-3 active:bg-surface-container"
                      >
                        <BusinessIconWell icon="folderStar" tone="brand" size="md" />
                        <View className="min-w-0 flex-1">
                          <VemtapText
                            variant="labelMd"
                            className="font-sans-semibold"
                            numberOfLines={2}
                          >
                            {category.title}
                          </VemtapText>
                          <VemtapText
                            variant="caption"
                            tone="secondary"
                            numberOfLines={1}
                          >
                            {category.countLabel}
                          </VemtapText>
                        </View>
                        <View className="shrink-0">
                          <Icon
                            name="expandMore"
                            size={20}
                            color={colors.textTertiary}
                            style={
                              open ? { transform: [{ rotate: '180deg' }] } : undefined
                            }
                          />
                        </View>
                      </Pressable>
                      {open ? (
                        <View className="gap-1 px-3 pb-3">
                          {category.articles.map(article => (
                            <ArticleRow
                              key={article.id}
                              article={article}
                              open={openArticles.includes(article.id)}
                              onToggle={() =>
                                toggle(openArticles, article.id, setOpenArticles)
                              }
                            />
                          ))}
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ) : (
              <EmptyState
                icon="folderStar"
                variant="contained"
                title={copy.empty.title}
                description={copy.empty.body}
              />
            )}
          </BusinessPanel>

          <BusinessPanel
            className="mt-3"
            title={copy.ticketsTitle}
            subtitle={copy.ticketsSubtitle}
            icon="confirmation"
          >
            {tickets && tickets.length ? (
              <View className="gap-2">
                {tickets.map(ticket => (
                  <Pressable
                    key={ticket.id}
                    accessibilityRole="button"
                    accessibilityLabel={ticket.subject}
                    onPress={() => onOpenTicket?.(ticket.id)}
                    className="gap-1.5 rounded-field bg-surface-subtle p-3 active:bg-surface-container"
                  >
                    <View className="flex-row items-start justify-between gap-2">
                      <VemtapText
                        variant="labelMd"
                        className="min-w-0 flex-1 font-sans-semibold"
                        numberOfLines={2}
                      >
                        {ticket.subject}
                      </VemtapText>
                      <BusinessStatusPill
                        label={ticket.status}
                        tone={ticket.statusTone}
                      />
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Icon name="folder" size={13} color={colors.textTertiary} />
                      <VemtapText
                        variant="caption"
                        tone="secondary"
                        className="min-w-0 flex-1"
                        numberOfLines={1}
                      >
                        {`${ticket.category} • ${ticket.priority} • ${ticket.time}`}
                      </VemtapText>
                      <Icon name="forward" size={15} color={colors.textTertiary} />
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <EmptyState
                icon="confirmation"
                variant="contained"
                title={copy.ticketsEmpty.title}
                description={copy.ticketsEmpty.body}
              />
            )}
          </BusinessPanel>
        </>
      )}

      <BottomSheet
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        title={copy.formTitle}
      >
        <View className="gap-3 px-6 pb-4">
          <FieldInput
            label={copy.fields.subject}
            placeholder={copy.fields.subjectPlaceholder}
            value={form.subject}
            onChangeText={value => setForm(current => ({ ...current, subject: value }))}
          />
          <FieldInput
            label={copy.fields.category}
            placeholder={copy.fields.categoryPlaceholder}
            value={form.category}
            onChangeText={value => setForm(current => ({ ...current, category: value }))}
          />
          <View className="gap-1.5">
            <VemtapText variant="labelSm" className="font-sans-semibold">
              {copy.fields.priority}
            </VemtapText>
            <View className="flex-row flex-wrap gap-2">
              {copy.priorities.map(priority => (
                <BusinessSelectionChip
                  key={priority}
                  label={priority}
                  selected={form.priority === priority}
                  onPress={() =>
                    setForm(current => ({
                      ...current,
                      priority: priority as TicketPriority,
                    }))
                  }
                />
              ))}
            </View>
          </View>
          <FieldInput
            label={copy.fields.message}
            placeholder={copy.fields.messagePlaceholder}
            value={form.message}
            onChangeText={value => setForm(current => ({ ...current, message: value }))}
            multiline
          />
          {formError ? (
            <VemtapText accessibilityRole="alert" variant="caption" tone="error">
              {formError}
            </VemtapText>
          ) : null}
          <View className="mt-1 flex-row gap-2">
            <Button
              label={copy.cancel}
              labelVariant="labelMd"
              variant="secondary"
              className="flex-1"
              onPress={() => setFormOpen(false)}
            />
            <Button
              label={copy.submit}
              labelVariant="labelMd"
              className="flex-1"
              onPress={submitTicket}
            />
          </View>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={Boolean(thread)}
        onClose={() => {
          setReply('');
          onCloseThread?.();
        }}
        title={thread?.subject ?? copy.ticketsTitle}
      >
        <View className="gap-3 px-6 pb-4">
          {thread ? (
            <View className="flex-row items-center gap-2">
              <BusinessStatusPill label={thread.status} tone={thread.statusTone} />
            </View>
          ) : null}

          {threadLoading ? (
            <VemtapText variant="caption" tone="secondary">
              {copy.loading}
            </VemtapText>
          ) : thread && thread.messages.length ? (
            <View className="gap-2">
              {thread.messages.map(message => (
                <View
                  key={message.id}
                  className={`max-w-[85%] gap-0.5 rounded-field p-2.5 ${
                    message.mine
                      ? 'self-end bg-surface-tint'
                      : 'self-start bg-surface-container'
                  }`}
                >
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {message.mine ? copy.youLabel : message.role}
                  </VemtapText>
                  <VemtapText variant="bodyMd" className="leading-snug">
                    {message.body}
                  </VemtapText>
                  <VemtapText variant="micro" tone="tertiary">
                    {message.time}
                  </VemtapText>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              variant="contained"
              title={copy.threadEmpty}
              description={copy.ticketsSubtitle}
            />
          )}

          <FieldInput
            label={copy.replyPlaceholder}
            value={reply}
            onChangeText={setReply}
            placeholder={copy.replyPlaceholder}
            accessibilityLabel={copy.replyPlaceholder}
            multiline
          />
          <Button
            className="mt-1"
            label={copy.replyCta}
            labelVariant="labelMd"
            onPress={submitReply}
          />
        </View>
      </BottomSheet>
    </BusinessScreenLayout>
  );
}

function ArticleRow({
  article,
  open,
  onToggle,
}: {
  article: KbArticleView;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="overflow-hidden rounded-field bg-surface">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={article.title}
        onPress={onToggle}
        className="min-h-10 flex-row items-center gap-2 p-2.5 active:bg-surface-container-low"
      >
        <View className="min-w-0 flex-1">
          <VemtapText variant="caption" className="font-sans-semibold" numberOfLines={2}>
            {article.title}
          </VemtapText>
          <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
            {article.section}
          </VemtapText>
        </View>
        <View className="shrink-0">
          <Icon
            name="expandMore"
            size={18}
            color={colors.textTertiary}
            style={open ? { transform: [{ rotate: '180deg' }] } : undefined}
          />
        </View>
      </Pressable>
      {open && article.summary ? (
        <View className="px-2.5 pb-2.5">
          <VemtapText variant="caption" tone="secondary" className="leading-relaxed">
            {article.summary}
          </VemtapText>
        </View>
      ) : null}
    </View>
  );
}
