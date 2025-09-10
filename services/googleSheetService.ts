
import { WorkflowState } from '../types';

export const saveToSheet = async (
    sessionId: string | null,
    sheetUrl: string | null,
    data: Record<string, any>
): Promise<{ success: boolean; message: string }> => {
    
    if (!sheetUrl) {
        return { success: true, message: "URL da Planilha Google não configurada. Pulando o salvamento." };
    }
    if (!sessionId) {
        return { success: false, message: "ID da sessão não encontrado. Não é possível salvar." };
    }

    const payload = {
        sessionId,
        data: data,
    };

    try {
        // O fetch real está comentado para evitar erros de CORS durante o desenvolvimento local
        // quando não há um script real configurado. Descomente quando estiver pronto para testar.
        await fetch(sheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
        });

        console.log("Dados enviados para a Planilha Google:", payload);
        return { success: true, message: "Dados enviados para a Planilha Google com sucesso." };

    } catch (error) {
        console.error("Falha ao enviar dados para a Planilha Google:", error);
        if (error instanceof Error) {
            return { success: false, message: `Falha ao salvar dados na Planilha Google: ${error.message}` };
        }
        return { success: false, message: "Ocorreu um erro desconhecido ao salvar na Planilha Google." };
    }
};