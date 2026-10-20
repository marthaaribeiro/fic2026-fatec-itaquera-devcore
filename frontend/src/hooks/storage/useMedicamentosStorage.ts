import { useEffect, useState } from "react";
import {
  buscarMedicamentosApi,
  obterMedicamentosCache,
} from "../../services/remedioService";
import type { MedicamentoItem } from "../../types/medication";

interface UseMedicamentosStorageOptions {
  initialItems?: MedicamentoItem[];
  loadFromApi?: boolean;
  listenToAuthChange?: boolean;
  ignoreEmptyUpdates?: boolean;
}

export function useMedicamentosStorage({
  initialItems = [],
  loadFromApi = false,
  listenToAuthChange = false,
  ignoreEmptyUpdates = false,
}: UseMedicamentosStorageOptions = {}) {
  const [medicamentos, setMedicamentos] = useState<MedicamentoItem[]>(() => {
    const cache = obterMedicamentosCache();
    return cache.length > 0 ? cache : initialItems;
  });

  useEffect(() => {
    let ativo = true;

    if (loadFromApi) {
      buscarMedicamentosApi().then((dados) => {
        if (ativo) setMedicamentos(dados);
      });
    }

    function sincronizar() {
      const cache = obterMedicamentosCache();
      if (ativo && (!ignoreEmptyUpdates || cache.length > 0)) {
        setMedicamentos(cache);
      }
    }

    window.addEventListener("ong_medicamentos_atualizados", sincronizar);
    if (listenToAuthChange) {
      window.addEventListener("ong_auth_change", sincronizar);
    }

    return () => {
      ativo = false;
      window.removeEventListener("ong_medicamentos_atualizados", sincronizar);
      if (listenToAuthChange) {
        window.removeEventListener("ong_auth_change", sincronizar);
      }
    };
  }, [ignoreEmptyUpdates, listenToAuthChange, loadFromApi]);

  return { medicamentos, setMedicamentos };
}
