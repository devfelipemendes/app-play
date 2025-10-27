import React, { useState } from 'react'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { ChevronDown } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import { TouchableOpacity, Modal } from 'react-native'
import { ScrollView } from '@/components/ui/scroll-view'
import { formatDateToBR } from '@/src/utils/formatDateToBr'
import { formatPhoneNumber } from '@/src/utils/PhoneFormatter'

interface LineSelectorProps {
  selectedLine: any
  userLines: any[]
  onLineChange: (line: any) => void
  colors: any
  loading?: boolean
}

const LineSelector = ({
  selectedLine,
  userLines,
  onLineChange,
  colors,
  loading = false,
}: LineSelectorProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Mostrar TODAS as linhas (com ou sem MSISDN)
  const allLines = userLines

  const handleLineSelect = (line: any) => {
    setIsModalOpen(false)
    onLineChange(line)
  }

  if (!selectedLine || allLines.length <= 1) {
    // Se só tem uma linha ou nenhuma, mostrar sem dropdown
    return selectedLine ? (
      <Box
        style={{
          padding: 12,
          borderRadius: 12,
          backgroundColor: colors.background,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.24,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <HStack
          style={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <VStack style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 2,
              }}
            >
              {formatPhoneNumber(selectedLine.msisdn) || 'Sem MSISDN Ativo'}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.secondary,
              }}
            >
              {selectedLine.plandescription !== 'PLAY VOZ 0MIN | 1GB'
                ? selectedLine.plandescription
                : 'Ainda não temos um plano ativo'}
            </Text>
          </VStack>
        </HStack>
      </Box>
    ) : null
  }

  return (
    <>
      {/* Selector clicável */}
      <TouchableOpacity
        onPress={() => !loading && setIsModalOpen(true)}
        disabled={loading}
        style={{
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Box
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: colors.background,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.24,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <HStack
            style={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <VStack style={{ flex: 1 }}>
              <HStack style={{ alignItems: 'center', gap: 8 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: colors.text,
                  }}
                >
                  {formatPhoneNumber(selectedLine.msisdn) || 'Sem MSISDN Ativo'}
                </Text>
                {allLines.length > 1 && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: colors.primary,
                      backgroundColor: colors.primary + '20',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 8,
                    }}
                  >
                    {allLines.length} linhas
                  </Text>
                )}
              </HStack>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.secondary,
                  marginTop: 2,
                }}
              >
                {(selectedLine.plandescription !== 'PLAY VOZ 0MIN | 1GB'
                  ? selectedLine.plandescription
                  : 'Ainda não temos um plano ativo') || selectedLine.iccid}
              </Text>
            </VStack>

            <HStack style={{ alignItems: 'center', gap: 8 }}>
              {/* <Box
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor:
                    selectedLine.rede === 'TIM' ? '#0066CC' : '#6A0DAD',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {selectedLine.rede}
                </Text>
              </Box> */}

              {allLines.length > 1 && (
                <Icon
                  as={ChevronDown}
                  size="sm"
                  style={{
                    color: colors.primary,
                    transform: [{ rotate: isModalOpen ? '180deg' : '0deg' }],
                  }}
                />
              )}
            </HStack>
          </HStack>
        </Box>
      </TouchableOpacity>

      {/* Modal de seleção */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
          activeOpacity={1}
          onPress={() => setIsModalOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.background,
              borderRadius: 16,
              maxHeight: '70%',
              width: '100%',
              maxWidth: 400,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <VStack style={{ padding: 16, height: '100%' }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text,
                  marginBottom: 16,
                  textAlign: 'center',
                }}
              >
                Selecionar Linha
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                <VStack style={{ gap: 8 }}>
                  {allLines.map((line, index) => (
                    <TouchableOpacity
                      key={line.id}
                      onPress={() => handleLineSelect(line)}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        backgroundColor:
                          selectedLine.id === line.id
                            ? colors.primary + '20'
                            : colors.background,
                        borderWidth: 1,
                        borderColor:
                          selectedLine.id === line.id
                            ? colors.primary
                            : colors.secondary + '30',
                      }}
                    >
                      <HStack
                        style={{
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <VStack style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight:
                                selectedLine.id === line.id ? 'bold' : '500',
                              color: colors.text,
                              marginBottom: 2,
                            }}
                          >
                            {formatPhoneNumber(line.msisdn) ||
                              'Sem MSISDN Ativo'}
                          </Text>
                          {line.msisdn && (
                            <Text
                              style={{
                                fontSize: 12,
                                color: colors.secondary,
                              }}
                            >
                              {line.plandescription}
                            </Text>
                          )}
                          {formatPhoneNumber(line.msisdn) !== null && (
                            <Text
                              style={{
                                fontSize: 10,
                                color: colors.subTitle,
                                marginTop: 2,
                              }}
                            >
                              {line.msisdn
                                ? 'Vence:'
                                : 'Selecione a linha e ative um novo CHIP para começar a usar'}{' '}
                              {formatDateToBR(line.bundleexpiry)}
                            </Text>
                          )}
                        </VStack>
                        {/* 
                        <Box
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                            backgroundColor:
                              line.rede === 'TIM' ? '#0066CC' : '#6A0DAD',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: 'bold',
                              color: 'white',
                            }}
                          >
                            {line.rede}
                          </Text>
                        </Box> */}
                      </HStack>
                    </TouchableOpacity>
                  ))}
                </VStack>
              </ScrollView>

              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                style={{
                  marginTop: 16,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: colors.textButton,
                    fontWeight: '500',
                    backgroundColor: colors.primary,
                  }}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
            </VStack>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

export default LineSelector
