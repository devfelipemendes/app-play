// components/DevTools.tsx
import React, { useState } from 'react'
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/text'
import { useAppSelector } from '@/src/store/hooks'
import { apiPlay } from '@/src/api/apiPlay'
import { useSelector, useDispatch } from 'react-redux'
import { Trash2 } from 'lucide-react-native'

const DevTools = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'queries' | 'mutations' | 'state'>('queries')
  const dispatch = useDispatch()

  // Pegar o estado do RTK Query
  const apiState = useSelector((state: any) => state.apiPlay)

  // Estado da auth
  const authState = useAppSelector((state) => state.auth)

  if (!__DEV__) return null

  const queries = apiState?.queries || {}
  const mutations = apiState?.mutations || {}
  const subscriptions = apiState?.subscriptions || {}

  // Inverter a ordem: mais recentes primeiro (baseado no timestamp)
  const queryEntries = Object.entries(queries).sort(([, a]: any, [, b]: any) => {
    const timeA = a.fulfilledTimeStamp || a.startedTimeStamp || 0
    const timeB = b.fulfilledTimeStamp || b.startedTimeStamp || 0
    return timeB - timeA // Ordem decrescente (mais recentes primeiro)
  })

  const mutationEntries = Object.entries(mutations).sort(([, a]: any, [, b]: any) => {
    const timeA = a.fulfilledTimeStamp || a.startedTimeStamp || 0
    const timeB = b.fulfilledTimeStamp || b.startedTimeStamp || 0
    return timeB - timeA // Ordem decrescente (mais recentes primeiro)
  })

  // Função para limpar o cache do RTK Query
  const handleClearCache = () => {
    dispatch(apiPlay.util.resetApiState())
  }

  return (
    <>
      {/* Botão flutuante */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingButtonText}>
          {isOpen ? '✕' : '🔍'}
        </Text>
      </TouchableOpacity>

      {/* Panel DevTools */}
      {isOpen && (
        <View style={styles.panel}>
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'queries' && styles.tabActive,
              ]}
              onPress={() => setSelectedTab('queries')}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'queries' && styles.tabTextActive,
                ]}
              >
                Queries ({queryEntries.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'mutations' && styles.tabActive,
              ]}
              onPress={() => setSelectedTab('mutations')}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'mutations' && styles.tabTextActive,
                ]}
              >
                Mutations ({mutationEntries.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'state' && styles.tabActive,
              ]}
              onPress={() => setSelectedTab('state')}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'state' && styles.tabTextActive,
                ]}
              >
                State
              </Text>
            </TouchableOpacity>

            {/* Botão de Clear */}
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearCache}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {selectedTab === 'queries' && (
              <View>
                {queryEntries.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhuma query ativa</Text>
                ) : (
                  queryEntries.map(([key, query]: [string, any]) => (
                    <View key={key} style={styles.item}>
                      <Text style={styles.itemTitle}>
                        {query.endpointName || 'Unknown'}
                      </Text>
                      <View style={styles.statusBadge}>
                        <Text
                          style={[
                            styles.statusText,
                            query.status === 'fulfilled' && styles.statusSuccess,
                            query.status === 'pending' && styles.statusPending,
                            query.status === 'rejected' && styles.statusError,
                          ]}
                        >
                          {query.status}
                        </Text>
                      </View>

                      {/* Args */}
                      {query.originalArgs && (
                        <>
                          <Text style={styles.sectionLabel}>📤 Request:</Text>
                          <Text style={styles.itemDetail}>
                            {JSON.stringify(query.originalArgs, null, 2)}
                          </Text>
                        </>
                      )}

                      {/* Response Data */}
                      {query.data && (
                        <>
                          <Text style={styles.sectionLabel}>📥 Response:</Text>
                          <Text style={styles.itemDetail}>
                            {JSON.stringify(query.data, null, 2)}
                          </Text>
                        </>
                      )}

                      {/* Error */}
                      {query.error && (
                        <>
                          <Text style={styles.sectionLabel}>❌ Error:</Text>
                          <Text style={styles.errorText}>
                            {JSON.stringify(query.error, null, 2)}
                          </Text>
                        </>
                      )}

                      {/* Timestamps */}
                      {query.fulfilledTimeStamp && (
                        <Text style={styles.timestampText}>
                          ⏱️ {new Date(query.fulfilledTimeStamp).toLocaleTimeString()}
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}

            {selectedTab === 'mutations' && (
              <View>
                {mutationEntries.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhuma mutation executada</Text>
                ) : (
                  mutationEntries.map(([key, mutation]: [string, any]) => (
                    <View key={key} style={styles.item}>
                      <Text style={styles.itemTitle}>
                        {mutation.endpointName || 'Unknown'}
                      </Text>
                      <View style={styles.statusBadge}>
                        <Text
                          style={[
                            styles.statusText,
                            mutation.status === 'fulfilled' &&
                              styles.statusSuccess,
                            mutation.status === 'pending' &&
                              styles.statusPending,
                            mutation.status === 'rejected' && styles.statusError,
                          ]}
                        >
                          {mutation.status}
                        </Text>
                      </View>

                      {/* Args */}
                      {mutation.originalArgs && (
                        <>
                          <Text style={styles.sectionLabel}>📤 Request:</Text>
                          <Text style={styles.itemDetail}>
                            {JSON.stringify(mutation.originalArgs, null, 2)}
                          </Text>
                        </>
                      )}

                      {/* Response Data */}
                      {mutation.data && (
                        <>
                          <Text style={styles.sectionLabel}>📥 Response:</Text>
                          <Text style={styles.itemDetail}>
                            {JSON.stringify(mutation.data, null, 2)}
                          </Text>
                        </>
                      )}

                      {/* Error */}
                      {mutation.error && (
                        <>
                          <Text style={styles.sectionLabel}>❌ Error:</Text>
                          <Text style={styles.errorText}>
                            {JSON.stringify(mutation.error, null, 2)}
                          </Text>
                        </>
                      )}

                      {/* Timestamps */}
                      {mutation.fulfilledTimeStamp && (
                        <Text style={styles.timestampText}>
                          ⏱️ {new Date(mutation.fulfilledTimeStamp).toLocaleTimeString()}
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}

            {selectedTab === 'state' && (
              <View>
                <Text style={styles.sectionTitle}>Auth State</Text>
                <Text style={styles.codeText}>
                  {JSON.stringify(
                    {
                      isAuthenticated: authState.isAuthenticated,
                      user: authState.user?.name,
                      cpf: authState.user?.cpf,
                      loadingAuth: authState.loadingAuth,
                      loadingSystem: authState.loadingSystem,
                    },
                    null,
                    2,
                  )}
                </Text>

                <Text style={styles.sectionTitle}>Cache Info</Text>
                <Text style={styles.itemDetail}>
                  Queries: {queryEntries.length}
                </Text>
                <Text style={styles.itemDetail}>
                  Mutations: {mutationEntries.length}
                </Text>
                <Text style={styles.itemDetail}>
                  Subscriptions: {Object.keys(subscriptions).length}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 9999,
  },
  floatingButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  panel: {
    position: 'absolute',
    bottom: 170,
    left: 10,
    right: 10,
    maxHeight: '60%',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    zIndex: 9998,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#6366f1',
    fontWeight: '700',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#374151',
  },
  content: {
    padding: 12,
  },
  item: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 11,
    color: '#d1d5db',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  statusSuccess: {
    backgroundColor: '#10b981',
  },
  statusPending: {
    backgroundColor: '#f59e0b',
  },
  statusError: {
    backgroundColor: '#ef4444',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
    marginTop: 12,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 11,
    color: '#d1d5db',
    fontFamily: 'monospace',
    backgroundColor: '#111827',
    padding: 8,
    borderRadius: 4,
  },
  errorText: {
    fontSize: 11,
    color: '#fca5a5',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#93c5fd',
    marginTop: 8,
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 8,
    fontStyle: 'italic',
  },
})

export default DevTools
