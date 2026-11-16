# LoRAs para Qwen Image 2.1

Este documento organiza as LoRAs já registradas no gerador do projeto, as opções listadas pelo Space da Hugging Face e outras candidatas encontradas para Qwen Image 2.1.

## Como interpretar o status

- **Registrada no servidor** significa que o identificador está na lista permitida do `qwen-pod-server.py`. O servidor baixa/carrega a LoRA sob demanda no primeiro uso; isso não garante que esteja carregada agora no Pod.
- **Candidata** significa que a página da LoRA declara relação com Qwen Image 2.1, mas ainda precisa de teste no pipeline Diffusers atual.
- **Fluxo específico** significa que a opção requer mais do que escolher um adapter: por exemplo, duas imagens ou parâmetros de geração diferentes.
- Nomes de arquivo e compatibilidade foram organizados a partir dos metadados e arquivos publicados nos repositórios indicados. Confirme licença, instruções e versão do arquivo antes de uso comercial.

## Já registradas no servidor do projeto

| LoRA | Repositório Hugging Face | Arquivo de pesos | O que oferece | Situação no projeto |
|---|---|---|---|---|
| ChatR Labs Omni LoRA v0.1 | [chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1](https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1) | `chatrlabs-omni-lora-v0.1-bf16.safetensors` | Adapter geral para geração e edição, descrito como uncensored/omni. | Registrada como `chatrlabs`; carregamento sob demanda. |
| f23gg NSFW LoRA | [f23gg/NSFW-LORA-Qwen-Image-2.1](https://huggingface.co/f23gg/NSFW-LORA-Qwen-Image-2.1) | `NSFW Qwen Lora.safetensors` | Adapter de geração de imagem. A página o identifica como Qwen Image 2.1. | Registrada como `f23gg`; carregamento sob demanda. A página indica foco em texto-para-imagem, então edição pode não ser seu uso ideal. |

### Referência antiga encontrada na documentação

| LoRA | Repositório Hugging Face | Arquivo de pesos | Observação |
|---|---|---|---|
| Abenzerps Uncensored | [abenzerps/Qwen-Image-2.1-Uncensored-GGUF](https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF) | `qwen-image-2.1-uncensored-lora.safetensors` | Aparece em documentos antigos do projeto, mas **não** na lista ativa de LoRAs do servidor. Não contar como opção atualmente registrada sem conferir o repositório/arquivo e testar de novo. |

## LoRAs listadas pelo Space “Qwen Image 2.1 Uncensored All-In-One LoRA Studio”

Space: [Aldjg/qwen-image-2.1-uncensored-aio-loras-2](https://huggingface.co/spaces/Aldjg/qwen-image-2.1-uncensored-aio-loras-2)

| LoRA / recurso | Repositório Hugging Face | Arquivo de pesos | O que oferece | Esforço provável para o servidor atual |
|---|---|---|---|---|
| Anime Consistency | [WarmBloodAban/Qwen-Image-2.1-LoRAs](https://huggingface.co/WarmBloodAban/Qwen-Image-2.1-LoRAs) | `Qwen2.1_Anime_consistency.safetensors` | Estilo anime e maior consistência visual. | Candidata direta: testar carregamento, escala e resultado. |
| Anything to Real Photo | [WarmBloodAban/Qwen-Image-2.1-LoRAs](https://huggingface.co/WarmBloodAban/Qwen-Image-2.1-LoRAs) | `Qwen2.1_Anything2RealCharacters.safetensors` | Tenta levar personagens/arte para uma aparência fotográfica. | Candidata direta; avaliar se o efeito serve ao estilo do produto. |
| Natural Exposure (Photorealism) | [prithivMLmods/Qwen-Image-2.1-Natural-Exposure-LoRA](https://huggingface.co/prithivMLmods/Qwen-Image-2.1-Natural-Exposure-LoRA) | `Qwen-Image-2.1-Natural-Exposure-LoRA-4000.safetensors` | Aparência fotográfica e exposição natural; há também checkpoints numerados no repositório. | Candidata, mas a página classifica o modelo também para image-to-image; validar geração e edição separadamente. |
| Detail Enhancer | [reverentelusarca/elusarcas-qwen-2.1-detail-enhancer-lora](https://huggingface.co/reverentelusarca/elusarcas-qwen-2.1-detail-enhancer-lora) | `elusarcas-qwen2-1-detailer-v1.safetensors` | Busca reforçar detalhes e texturas. | Candidata direta; comparar qualidade e artefatos com a base. |
| Viggle Turbo (4 passos) | [Viggle/Qwen-Image-2.1-viggle-turbo](https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo) | `Qwen-Image-2.1-viggle-turbo-4step-lora-r64.safetensors` | Destilação para geração rápida em poucos passos. | Requer ajustar steps e testar guidance; não adicionar como LoRA comum mantendo os parâmetros atuais. |
| Viggle Turbo v0.2.1 (6 passos) | [Viggle/Qwen-Image-2.1-viggle-turbo](https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo) | `Qwen-Image-2.1-viggle-turbo-v0.2.1-6step-lora-r256.safetensors` | Variante turbo de seis passos. | Requer configuração de geração específica e teste separado. |
| Fun-Acc Turbo (4 passos) | [alibaba-pai/Qwen-Image-2.1-Fun-Acc-LoRAs](https://huggingface.co/alibaba-pai/Qwen-Image-2.1-Fun-Acc-LoRAs) | `models/Qwen-Image-2.1-Fun-Acc-4Step.safetensors` | Adapter acelerado de quatro passos. | Requer verificar compatibilidade com Diffusers e configurar steps/guidance; a página usa componentes do VideoX-Fun. |
| BFS Best Face Swap | [Alissonerdx/BFS-Best-Face-Swap](https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap) | `bfs_head_v1.1_qwen_2.1.safetensors` | Troca de cabeça/rosto usando uma imagem base e uma imagem doadora. | Não é só adicionar um item ao seletor: precisa de endpoint/UI com duas imagens e instruções de edição próprias. |
| LoRA personalizada do Hugging Face | Repositório e arquivo informados pelo usuário | Depende da LoRA selecionada | Permite apontar para adapters fora da lista curada. | O Space implementa esse campo, mas o servidor do projeto não aceita atualmente repositório/arquivo arbitrários. Exige validação, limites de download/cache e controles de segurança. |

### Recursos do Space que não são apenas uma LoRA

O Space também oferece modos de múltiplas referências (até seis imagens), edição com uma referência, transformação/troca com duas referências e saída PNG transparente. Esses recursos envolvem a interface e o fluxo de inferência; não são habilitados apenas registrando novos pesos.

O Space usa a base GGUF [KasugaiSakura/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF](https://huggingface.co/KasugaiSakura/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF), enquanto o servidor atual do projeto carrega `Qwen/Qwen-Image-2.1` com `QwenImage21Pipeline` no Diffusers. Portanto, o Space é uma referência de recursos, não prova automática de compatibilidade de cada adapter com o backend atual.

## Outras candidatas encontradas no Hugging Face

| LoRA | Repositório Hugging Face | Arquivo de pesos | O que se sabe | Avaliação inicial |
|---|---|---|---|---|
| chfm NSFW LoRA | [chfm/NSFW-LORA-Qwen-Image-2.1](https://huggingface.co/chfm/NSFW-LORA-Qwen-Image-2.1) | `NSFW Qwen Lora.safetensors` | Metadados declaram Qwen Image 2.1, Diffusers e texto-para-imagem. | Candidata adicional mais simples para teste técnico; pouca adoção visível, então não presumir qualidade. |
| duncankranov NSFW LoRA | [duncankranov/NSFW-LORA-Qwen-Image-2.1](https://huggingface.co/duncankranov/NSFW-LORA-Qwen-Image-2.1) | `NSFW Qwen Lora.safetensors` | Metadados declaram Qwen Image 2.1 e Diffusers; repositório muito recente na consulta. | Experimental; validar origem, histórico e pesos antes de baixar para o servidor. |
| Wickedlizerd NSFW LoRA | [Wickedlizerd/NSFW-Qwen-Image-2.1-LoRA](https://huggingface.co/Wickedlizerd/NSFW-Qwen-Image-2.1-LoRA) | `nsfw_qwen_21.safetensors` | Marcada para Qwen Image 2.1, image-to-image e ComfyUI. | Pode exigir conversão ou ajustes para o pipeline Diffusers atual. |
| RunningHub AIO NSFW LoRA | [RunningHubAI/rh-qwen-image-2.1-aio-nsfw-lora](https://huggingface.co/RunningHubAI/rh-qwen-image-2.1-aio-nsfw-lora) | `Qwen-Image-2.1 NSFW Image Edit.safetensors` | Arquivo publicado como LoRA de edição para Qwen 2.1; metadados são limitados. | Compatibilidade menos clara; conferir README e testar antes de registrar. |

## Resumo e recomendação de avaliação

1. O servidor tem **duas LoRAs registradas** (`chatrlabs` e `f23gg`); elas são carregadas sob demanda, não necessariamente mantidas carregadas na GPU.
2. Para um teste inicial no backend atual, priorizar **Anime Consistency** e **Detail Enhancer** (ou **Anything to Real Photo**, caso o objetivo seja realismo). Testar uma por vez com o mesmo prompt, seed e parâmetros.
3. Tratar as opções turbo como uma experiência separada, pois dependem de poucos steps e parâmetros compatíveis com a destilação.
4. Tratar Face Swap e modos de várias referências como funcionalidades de produto/backend, não como simples entradas novas no seletor de LoRA.
5. Antes de disponibilizar qualquer adapter, confirmar licença e instruções do autor, validar formato/compatibilidade e medir memória, tempo, qualidade e artefatos no Pod real.

Esta tabela é um inventário de candidatos, não uma afirmação de que todos foram testados ou instalados no Pod.
